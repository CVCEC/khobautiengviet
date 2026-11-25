#!/usr/bin/env python3
"""Robot giọng đọc AI (Google Gemini) của Trường Tiếng Việt Của Em – bản dùng chung cho mọi kho. Chạy trên GitHub Actions.

Chép từ công cụ giọng đọc AI của vuihoctiengviet / venhaem (cùng mô hình, cùng giọng Kore, cùng cách nghe lại bằng Whisper).
Đọc giong-ai/can-doc.tsv (cột: tep, chu, nhom, cach) → ghi tệp mp3 đúng đường dẫn ở cột "tep".
Tệp đã có (kể cả bản thu giọng người thật) thì bỏ qua, không ghi đè.
Mỗi lượt gọi đọc một lô nhiều câu, nghỉ giữa các câu, rồi cắt theo các khoảng lặng dài nhất.
Whisper nghe lại từng câu; câu nghe khác chữ được đánh dấu trong giong-ai/kiem-tra.tsv để người nghe kiểm tra.
Sau mỗi lô, nếu kho có tools/gan_giong.py thì chạy để trang biết câu nào đã có tệp.

Cột "cach" (cách đọc):  (trống) câu thường · van = chữ cái, vần, đánh vần · truyen = kể chuyện
                        nhip = đồng dao, vè đọc theo nhịp · ca-bai = cả bài đồng dao (đọc riêng, một lô một bài)

Biến môi trường (đặt trong giong-ai/chay.txt):
  GEMINI_API_KEY   khoá API (GitHub secret)
  GIONG            tên giọng (mặc định Kore)
  GIONG_VUNG       bac | nam (mặc định bac)
  LO               số câu tối đa mỗi lượt gọi (mặc định 20)
  LO_CHU           số chữ cái tối đa mỗi lượt gọi (mặc định 700)
  TOI_DA_LUOT      số lượt gọi tối đa trong lần chạy này (mặc định 400)
  PHUT             thời gian chạy tối đa, phút (mặc định 300)
  MODEL            tên mô hình (tuỳ chọn; mặc định thử lần lượt các mô hình đọc của Gemini)
  CHI_NHOM         chỉ làm câu của những nhóm này, ví dụ "bai-01,bai-02" (để chạy thử)
  TEN_GOC          tên góc học, ghi trong lời nhắn lưu (commit)
"""
import base64, shutil, datetime, difflib, json, os, pathlib, re, subprocess, sys, tempfile, time, unicodedata
import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent
TSV = ROOT / 'giong-ai/can-doc.tsv'
OUT = ROOT / 'giong-ai'
KT = OUT / 'kiem-tra.tsv'      # mã, Whisper nghe được, điểm giống (0–1)
LOI = OUT / 'loi.tsv'          # mã, lần lỗi, lý do
TT = OUT / 'trang-thai.md'

KEY = os.environ.get('GEMINI_API_KEY', '').strip()
MODELS = [m for m in [os.environ.get('MODEL', '').strip(),
                      'gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts',
                      'gemini-2.5-flash-tts', 'gemini-2.5-pro-preview-tts'] if m]
LO = int(os.environ.get('LO') or 20)
LO_CHU = int(os.environ.get('LO_CHU') or 700)
GIONG = (os.environ.get('GIONG') or 'Kore').strip()
TEN = (os.environ.get('TEN_GOC') or 'góc học').strip()
TOI_DA = int(os.environ.get('TOI_DA_LUOT') or 400)
HAN = time.time() + 60 * int(os.environ.get('PHUT') or 300)
VUNG = (os.environ.get('GIONG_VUNG') or 'bac').strip().lower()
CHI = [x.strip() for x in (os.environ.get('CHI_NHOM') or '').split(',') if x.strip()]
GIONG_VN = {'bac': 'a standard Northern Vietnamese (Hà Nội) accent', 'nam': 'a standard Southern Vietnamese (Sài Gòn) accent'}


NK = []  # nhật ký lần chạy → giong-ai/nhat-ky.txt


def ghi(*a):
    l = ' '.join(str(x) for x in a)
    print(l, flush=True); NK.append(l)


class Dung(Exception):
    """Dừng cả lần chạy (hết lượt, sai khoá…)."""


def nfc(s):
    return unicodedata.normalize('NFC', s)


def doc_tsv(p, n):
    d = {}
    if p.exists():
        for l in p.read_text(encoding='utf-8').splitlines()[1:]:
            f = l.split('\t')
            if f and f[0]:
                d[f[0]] = (f + [''] * n)[1:n + 1]
    return d


def ghi_tsv(p, dau, d):
    p.write_text(dau + '\n' + ''.join('\t'.join([k] + [str(x) for x in v]) + '\n' for k, v in sorted(d.items())), encoding='utf-8')


def diem_cua(v):
    try:
        return float(v[1])
    except (IndexError, ValueError, TypeError):
        return 1.0


def doc_cho_may(t):
    """Chữ gửi cho máy đọc: bỏ nhãn a) b) c) đầu câu."""
    return re.sub(r'^\s*[a-eđ]\)\s*', '', t).strip()


CACH = {
    '': "",
    'van': (" These are Vietnamese letters, rhymes (vần), single syllables or spelling steps for beginners. "
            "Pronounce each letter by its SOUND (a, bờ, cờ, dờ, đờ, gờ, hờ…), never by its letter name such as 'bê', 'xê', 'đê'. "
            "Keep every tone exactly as written. In spelling steps separated by dashes, make a short pause at each dash."),
    'truyen': (" This is a page of a fairy tale for young children. Read it like a warm, gentle storyteller, "
               "with natural expression, pausing at commas and full stops."),
    'nhip': (" These are lines of a Vietnamese children's folk rhyme (đồng dao, vè). Chant them rhythmically and cheerfully, "
             "one even beat per syllable, like children playing a clapping game."),
    'ca-bai': (" This is a whole Vietnamese children's folk rhyme (đồng dao, vè). Chant all of it once, rhythmically and cheerfully, "
               "one even beat per syllable, with a short pause at the end of each line."),
}


def loi_nhac(cau, cach=''):
    head = ("Read the following Vietnamese lines aloud for young children who are learning Vietnamese. "
            f"Use {GIONG_VN.get(VUNG, GIONG_VN['bac'])} and a warm, friendly, natural voice. Speak slowly and very clearly, "
            "pronouncing every tone carefully. Read each line exactly as written, once, in order, without adding, "
            "skipping or explaining anything." + CACH.get(cach, ''))
    if len(cau) > 1:
        head += " Pause between lines."
    return head + "\n\n" + " [long pause] [long pause]\n".join(cau)


# ---------- gọi Gemini ----------
model_dung = None


def goi(text, voice):
    """Trả về (pcm bytes, sample rate)."""
    global model_dung
    ds = [model_dung] if model_dung else MODELS
    loi_cuoi = ''
    for model in ds:
        for lan in range(7):
            url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
            body = {'contents': [{'parts': [{'text': text}]}],
                    'generationConfig': {'responseModalities': ['AUDIO'],
                                         'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}
            try:
                r = requests.post(url, headers={'x-goog-api-key': KEY, 'Content-Type': 'application/json'}, json=body, timeout=600)
            except requests.RequestException as e:
                loi_cuoi = f'mạng: {e}'; time.sleep(20 * (lan + 1)); continue
            if r.status_code == 200:
                j = r.json()
                pcm, rate = b'', 24000
                for c in j.get('candidates', [])[:1]:
                    for p in (c.get('content') or {}).get('parts', []):
                        d = p.get('inlineData') or p.get('inline_data')
                        if d and d.get('data'):
                            pcm += base64.b64decode(d['data'])
                            m = re.search(r'rate=(\d+)', d.get('mimeType', '') or d.get('mime_type', ''))
                            if m: rate = int(m.group(1))
                if not pcm:
                    raise ValueError('không có tiếng trả về: ' + json.dumps(j)[:300])
                model_dung = model
                return pcm, rate
            msg = r.text[:600]
            if r.status_code in (400, 404) and re.search(r'not found|not supported|is not available|unknown model|does not exist', msg, re.I):
                loi_cuoi = f'{model}: không dùng được'; break           # thử mô hình khác
            if r.status_code in (401, 403) or 'API_KEY_INVALID' in msg or 'API key not valid' in msg:
                raise Dung('Khoá API không dùng được (' + str(r.status_code) + '). Kiểm tra lại secret GEMINI_API_KEY.')
            if r.status_code == 429:
                if re.search(r'PerDay|per day|daily', msg, re.I):
                    raise Dung('Đã hết lượt trong ngày của gói hiện tại – lần chạy tự động ngày mai sẽ làm tiếp.')
                m = re.search(r'"retryDelay":\s*"(\d+)', r.text)
                time.sleep(int(m.group(1)) + 2 if m else 35); loi_cuoi = '429'; continue
            if r.status_code >= 500:
                time.sleep(15 * (lan + 1)); loi_cuoi = str(r.status_code); continue
            raise ValueError(f'{r.status_code}: {msg}')
        else:
            raise ValueError('thử nhiều lần không được: ' + loi_cuoi)
    raise Dung('Không tìm được mô hình đọc của Gemini dùng được với khoá này (' + loi_cuoi + ').')


# ---------- âm thanh ----------
def ff(*a):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *a], check=True)


def khoang_lang(wav, nguong='-40dB', d='0.25'):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(wav), '-af', f'silencedetect=noise={nguong}:d={d}', '-f', 'null', '-'],
                       capture_output=True, text=True)
    s = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', p.stderr)]
    e = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', p.stderr)]
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(wav)],
                               capture_output=True, text=True, check=True).stdout.strip())
    if len(e) < len(s): e.append(dur)
    return list(zip(s, e)), dur


def cat_lo(wav, n):
    """Chia file đọc n câu thành n đoạn theo n-1 khoảng lặng dài nhất. Trả về [(đầu, cuối)] hoặc None."""
    ls, dur = khoang_lang(wav)
    trong = [(a, b) for a, b in ls if a > 0.15 and b < dur - 0.15]
    if n == 1:
        return [(0.0, dur)]
    if len(trong) < n - 1:
        return None
    theo_do_dai = sorted(trong, key=lambda x: x[1] - x[0], reverse=True)
    chon, con = theo_do_dai[:n - 1], theo_do_dai[n - 1:]
    ngan_nhat = min(b - a for a, b in chon)
    if ngan_nhat < 0.55 or (con and ngan_nhat < 1.3 * max(b - a for a, b in con)):
        return None
    chon.sort()
    bien = [0.0] + [x for ab in chon for x in ab] + [dur]
    return [(max(0.0, bien[2 * i] - (0.10 if i else 0)), min(dur, bien[2 * i + 1] + 0.15)) for i in range(n)]


def dong_hang(exp, rec):
    """Dóng hàng hai dãy chữ (sửa–xoá–chèn, chi phí 1). Trả về vị trí trong rec cho từng chữ của exp (None nếu bị bỏ)."""
    n, m = len(exp), len(rec)
    D = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1): D[i][0] = i
    for j in range(1, m + 1): D[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            D[i][j] = min(D[i - 1][j - 1] + (0 if exp[i - 1] == rec[j - 1] else 1), D[i - 1][j] + 1, D[i][j - 1] + 1)
    vt, i, j = [None] * n, n, m
    while i > 0 and j > 0:
        if D[i][j] == D[i - 1][j - 1] + (0 if exp[i - 1] == rec[j - 1] else 1):
            vt[i - 1] = j - 1; i -= 1; j -= 1
        elif D[i][j] == D[i - 1][j] + 1:
            i -= 1
        else:
            j -= 1
    return vt


def cat_theo_chu(wav, cau):
    """Dùng mốc thời gian từng chữ của Whisper để tìm chỗ chuyển câu, rồi cắt ở khoảng lặng gần đó."""
    nap_whisper()
    segs, _ = _whisper.transcribe(str(wav), language='vi', beam_size=5, word_timestamps=True, condition_on_previous_text=False)
    rec = []  # (chữ, đầu, cuối)
    for sg in segs:
        for w in (sg.words or []):
            for t in chuan(w.word):
                rec.append((t, w.start, w.end))
    exp, dong = [], []
    for i, c in enumerate(cau):
        for t in chuan(c):
            exp.append(t); dong.append(i)
    if not rec or not exp:
        return None
    vt = dong_hang(exp, [r[0] for r in rec])
    dau, cuoi = [None] * len(cau), [None] * len(cau)
    for k, j in enumerate(vt):
        if j is None: continue
        i = dong[k]
        dau[i] = rec[j][1] if dau[i] is None else min(dau[i], rec[j][1])
        cuoi[i] = rec[j][2] if cuoi[i] is None else max(cuoi[i], rec[j][2])
    if any(x is None for x in dau):
        return None
    ls, dur = khoang_lang(wav, d='0.15')
    doan = []
    for i in range(len(cau)):
        a = 0.0 if i == 0 else doan[-1][2]
        if i == len(cau) - 1:
            doan.append((a, dur, dur)); break
        if dau[i + 1] <= cuoi[i] - 0.05:
            return None
        gan = [(x, y) for x, y in ls if y > cuoi[i] - 0.3 and x < dau[i + 1] + 0.3]
        if gan:
            x, y = max(gan, key=lambda z: z[1] - z[0])
            ket, bat = x + 0.15, max(x, y - 0.10)
        else:
            mid = (cuoi[i] + dau[i + 1]) / 2; ket, bat = mid, mid
        doan.append((a, ket, bat))
    return [(a, b) for a, b, _ in doan]


def xuat_mp3(wav, a, b, out):
    ff('-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', str(wav), '-af',
       'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,'
       'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,'
       'afade=t=in:d=0.02,loudnorm=I=-18:TP=-1.5:LRA=11',
       '-ar', '24000', '-ac', '1', '-b:a', '64k', str(out))


# ---------- Whisper nghe lại ----------
_whisper = None


def nap_whisper():
    global _whisper
    if _whisper is None:
        from faster_whisper import WhisperModel
        _whisper = WhisperModel('medium', device='cpu', compute_type='int8')


def nghe(mp3):
    nap_whisper()
    segs, _ = _whisper.transcribe(str(mp3), language='vi', beam_size=5, vad_filter=False, condition_on_previous_text=False)
    return ' '.join(s.text.strip() for s in segs).strip()


DAU_CU = {a + b: c for a, b, c in [
    ('o', 'à', 'òa'), ('o', 'á', 'óa'), ('o', 'ả', 'ỏa'), ('o', 'ã', 'õa'), ('o', 'ạ', 'ọa'),
    ('o', 'è', 'òe'), ('o', 'é', 'óe'), ('o', 'ẻ', 'ỏe'), ('o', 'ẽ', 'õe'), ('o', 'ẹ', 'ọe'),
    ('u', 'ỳ', 'ùy'), ('u', 'ý', 'úy'), ('u', 'ỷ', 'ủy'), ('u', 'ỹ', 'ũy'), ('u', 'ỵ', 'ụy')]}
SO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']


def doc_so(n):
    if n < 10: return SO[n]
    if n < 20: return 'mười' + ('' if n == 10 else ' ' + ('lăm' if n % 10 == 5 else SO[n % 10]))
    if n < 100:
        c, d = divmod(n, 10)
        return SO[c] + ' mươi' + ('' if d == 0 else ' ' + {1: 'mốt', 4: 'tư', 5: 'lăm'}.get(d, SO[d]))
    if n < 1000:
        t, r = divmod(n, 100)
        return SO[t] + ' trăm' + ('' if r == 0 else (' linh ' + SO[r] if r < 10 else ' ' + doc_so(r)))
    return str(n)


def chuan(t):
    t = re.sub(r'\d+', lambda m: ' ' + doc_so(int(m.group())) + ' ', nfc(t))
    for cu, moi in DAU_CU.items():   # khoẻ / khỏe, hoà / hòa… là cùng một chữ
        t = t.replace(cu, moi)
    t = t.lower()
    t = re.sub(r'[^\w\s]', ' ', t)
    return t.split()


def giong_nhau(a, b):
    return round(difflib.SequenceMatcher(None, chuan(a), chuan(b)).ratio(), 2)


# ---------- lưu lên GitHub ----------
def luu(tom_tat):
    TT.write_text(tom_tat, encoding='utf-8')
    (OUT / 'nhat-ky.txt').write_text('\n'.join(NK[-600:]) + '\n', encoding='utf-8')
    if (ROOT / 'tools/gan_giong.py').exists():
        subprocess.run([sys.executable, 'tools/gan_giong.py'], cwd=ROOT, check=True)
    subprocess.run(['git', 'add', '-A'], cwd=ROOT, check=True)
    if subprocess.run(['git', 'diff', '--cached', '--quiet'], cwd=ROOT).returncode == 0:
        return
    subprocess.run(['git', 'commit', '-q', '-m', 'Giọng đọc AI: thêm câu cho ' + TEN], cwd=ROOT, check=True)
    for i in range(6):
        if subprocess.run(['git', 'pull', '-q', '--rebase'], cwd=ROOT).returncode == 0 and \
           subprocess.run(['git', 'push', '-q'], cwd=ROOT).returncode == 0:
            return
        time.sleep(5 + 3 * i)
    raise RuntimeError('không đẩy lên được')


def tep_cua(r):
    return ROOT / r['ma']


def main():
    rows = []
    for l in TSV.read_text(encoding='utf-8').splitlines()[1:]:
        tep, chu, nhom, cach = (l.split('\t') + ['', '', '', ''])[:4]
        if tep and chu:
            rows.append({'ma': tep, 'giong': GIONG, 'chu': chu.replace('\\n', '\n'), 'nhom': nhom, 'cach': cach.strip()})
    bo = set((OUT / 'bo.txt').read_text(encoding='utf-8').split()) if (OUT / 'bo.txt').exists() else set()
    kt = doc_tsv(KT, 2)
    loi = doc_tsv(LOI, 2)
    tong = len(rows)

    def con_lai():
        return [r for r in rows if r['ma'] not in bo and not tep_cua(r).exists()
                and int((loi.get(r['ma']) or ['0'])[0] or 0) < 2]

    viec = con_lai()
    if CHI:
        viec = [r for r in viec if r['nhom'] in CHI]

    luot, moi, ghi_chu = 0, 0, ''
    tmp = pathlib.Path(tempfile.mkdtemp())

    def tom_tat():
        xong = sum(1 for r in rows if tep_cua(r).exists())
        can = sum(1 for k, v in kt.items() if (ROOT / k).exists() and diem_cua(v) < 0.75)
        return (f"# Giọng đọc AI – trạng thái ({TEN})\n\n"
                f"- Lần chạy gần nhất: {datetime.datetime.utcnow():%Y-%m-%d %H:%M} UTC\n"
                f"- Mô hình: {model_dung or '(chưa gọi được)'} · giọng {GIONG} · {'miền Nam' if VUNG == 'nam' else 'miền Bắc'}\n"
                f"- Đã có tiếng: **{xong} / {tong}** câu (lần này thêm {moi}, dùng {luot} lượt gọi)\n"
                f"- Câu Whisper nghe hơi khác chữ (cần nghe kỹ, xem kiem-tra.tsv): {can}\n"
                f"- Câu bỏ qua theo yêu cầu (bo.txt): {len(bo)} · câu lỗi: {sum(1 for v in loi.values() if int(v[0] or 0) >= 2)}\n"
                + (f"- Ghi chú: {ghi_chu}\n" if ghi_chu else ''))

    if not KEY:
        ghi_chu = 'Chưa có khoá: thêm secret GEMINI_API_KEY (Settings → Secrets and variables → Actions, của kho hoặc của tổ chức CVCEC).'
        luu(tom_tat()); return
    if not viec:
        print('Không còn câu nào cần đọc.'); return

    # chia lô: giữ thứ tự trong can-doc.tsv; cùng nhóm và cùng cách đọc; giới hạn số câu và số chữ
    lo, cur = [], []
    for r in viec:
        if cur and (r['nhom'] != cur[0]['nhom'] or r['cach'] != cur[0]['cach'] or len(cur) >= LO
                    or sum(len(x['chu']) for x in cur) + len(r['chu']) > LO_CHU or r['cach'] == 'ca-bai'
                    or cur[0]['cach'] == 'ca-bai'):
            lo.append(cur); cur = []
        cur.append(r)
    if cur: lo.append(cur)

    try:
        hang = list(lo)
        while hang:
            if time.time() > HAN or luot >= TOI_DA:
                ghi_chu = 'Dừng vì đủ thời gian / số lượt của lần chạy này – lần sau làm tiếp.'; break
            nhom = hang.pop(0)
            cau = [doc_cho_may(r['chu']) for r in nhom]
            pcm, loi_goi = None, None
            for thu in range(2):            # Gemini đôi khi không trả tiếng ("audio stream could not be completed"): gọi lại một lần
                if luot >= TOI_DA: break
                luot += 1                   # mỗi lần gọi đều tính vào lượt trong ngày, kể cả lần hỏng
                try:
                    pcm, rate = goi(loi_nhac(cau, nhom[0]['cach']), nhom[0]['giong']); break
                except ValueError as e:
                    loi_goi = e; ghi(f'Lô {len(nhom)} câu – Gemini không trả tiếng: {str(e)[:160]}')
            if pcm is None:
                if loi_goi is None:
                    hang.insert(0, nhom); continue   # hết lượt của lần chạy – vòng lặp sẽ dừng
                for r in nhom:
                    n = int((loi.get(r['ma']) or ['0'])[0] or 0) + (1 if len(nhom) == 1 else 0)
                    loi[r['ma']] = [str(n), str(loi_goi)[:200].replace('\t', ' ').replace('\n', ' ')]
                if len(nhom) > 1:   # thử lại từng nửa
                    h = len(nhom) // 2; hang[:0] = [nhom[:h], nhom[h:]]
                ghi_tsv(LOI, 'ma\tlan\tly_do', loi); continue
            for r in nhom:
                loi.pop(r['ma'], None)
            raw = tmp / 'lo.pcm'; raw.write_bytes(pcm)
            wav = tmp / 'lo.wav'
            ff('-f', 's16le', '-ar', str(rate), '-ac', '1', '-i', str(raw), str(wav))
            doan = cat_lo(wav, len(nhom))
            if doan is None and len(nhom) > 1:
                doan = cat_theo_chu(wav, cau)
                ghi(f'Lô {len(nhom)} câu: khoảng lặng chưa rõ, cắt theo mốc chữ của Whisper' + ('' if doan else ' – không được'))
            if doan is None:
                ghi(f'Lô {len(nhom)} câu không cắt được, chia đôi để đọc lại')
                if len(nhom) > 1:
                    h = len(nhom) // 2; hang[:0] = [nhom[:h], nhom[h:]]
                continue
            kq, hong = [], None
            for r, (a, b) in zip(nhom, doan):
                out = tmp / (re.sub(r'[^A-Za-z0-9._-]', '_', r['ma']) + '.mp3')
                try:
                    if b - a < 0.25: raise ValueError('đoạn quá ngắn')
                    xuat_mp3(wav, a, b, out)
                    nghe_duoc = nghe(out)
                except Exception as e:   # đoạn cắt hỏng (rỗng, quá ngắn…)
                    hong = f'{r["chu"]}: {str(e)[:120]}'; break
                kq.append((r, out, nghe_duoc, giong_nhau(doc_cho_may(r['chu']), nghe_duoc)))
            if hong:
                ghi(f'Lô {len(nhom)} câu có đoạn cắt hỏng ({hong})' + (' – chia đôi để đọc lại' if len(nhom) > 1 else ''))
                if len(nhom) > 1:
                    h = len(nhom) // 2; hang[:0] = [nhom[:h], nhom[h:]]
                continue
            # Cắt lệch: tiếng của một câu giống câu ngay bên cạnh hơn câu của chính nó → bỏ cả lô, chia đôi để đọc lại
            lech = [r['chu'] for i, (r, _o, nd, d) in enumerate(kq) if d < 0.5 and len(chuan(r['chu'])) >= 3 and any(
                giong_nhau(doc_cho_may(kq[j][0]['chu']), nd) >= max(0.6, d + 0.25) for j in (i - 1, i + 1) if 0 <= j < len(kq))]
            if lech and len(nhom) > 1:
                ghi(f'Lô {len(nhom)} câu bị cắt lệch (ví dụ: {lech[0][:40]}) – chia đôi để đọc lại')
                h = len(nhom) // 2; hang[:0] = [nhom[:h], nhom[h:]]
                continue
            kem = sum(1 for x in kq if x[3] < 0.5)
            if len(nhom) > 1 and kem > max(2, len(nhom) * 0.3):
                ghi(f'Lô {len(nhom)} câu có {kem} câu lệch nhiều – có thể cắt sai, chia đôi để đọc lại')
                h = len(nhom) // 2; hang[:0] = [nhom[:h], nhom[h:]]
                continue
            for r, out, nghe_duoc, diem in kq:
                dich = tep_cua(r); dich.parent.mkdir(parents=True, exist_ok=True); shutil.move(str(out), str(dich))
                kt[r['ma']] = [nghe_duoc.replace('\t', ' '), str(diem)]
                moi += 1
                ghi(f"{diem:.2f}  {r['chu']}  |  {nghe_duoc}")
            ghi_tsv(KT, 'ma\tnghe\tdiem', kt)
            luu(tom_tat())   # lưu ngay sau mỗi lô để không mất tiếng đã đọc
    except Dung as e:
        ghi_chu = str(e)
    except Exception as e:  # ghi lỗi vào trang-thai.md để xem được mà không cần mở GitHub Actions
        import traceback; traceback.print_exc()
        ghi_chu = 'Lỗi khi chạy: ' + repr(e)[:400].replace('\n', ' ')
    finally:
        ghi_tsv(KT, 'ma\tnghe\tdiem', kt)
        if loi or LOI.exists(): ghi_tsv(LOI, 'ma\tlan\tly_do', loi)
        if not ghi_chu and not con_lai():
            ghi_chu = 'Đã đọc xong mọi câu.'
        luu(tom_tat())
        print(tom_tat())


if __name__ == '__main__':
    main()
