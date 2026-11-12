/* Kho Báu Lời Ông Bà — ứng dụng (không cần thư viện ngoài) */
(function () {
  'use strict';
  const D = window.KHO, ART = window.ART;
  const TYPES = D.TYPES, ITEMS = D.items, TK = ['thanh-ngu', 'tuc-ngu', 'ca-dao'];
  const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  const ofType = (t) => ITEMS.filter((i) => i.type === t);
  const bare = (s) => s.replace(/[.,!?;:"“”«»]/g, '');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const IMG = (n) => `assets/trau-${n}.png`;
  const firstLine = (it) => it.text || it.lines[0];
  const twoLines = (it) => it.text || it.lines.slice(0, 2).join(' / ');
  const numIn = (it) => ofType(it.type).indexOf(it) + 1;
  const CV = { 'thanh-ngu': 'tn', 'tuc-ngu': 'tg', 'ca-dao': 'cd' };
  const cvars = (t) => `--c:var(--${CV[t]});--cbg:var(--${CV[t]}-bg);--cmid:var(--${CV[t]}-mid)`;
  const app = document.getElementById('app');

  /* ── lưu tiến độ trên máy (mỗi bạn một trình duyệt) ── */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('khobau:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('khobau:' + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  };
  const S = { stickers: store.get('stickers', {}), stars: store.get('stars', 0), best: store.get('best', {}), sound: store.get('sound', true), played: store.get('played', 0), practice: store.get('practice', {}) };
  const save = () => { ['stickers', 'stars', 'best', 'sound', 'played', 'practice'].forEach((k) => store.set(k, S[k])); updateTop(); };
  const nStick = (t) => ITEMS.filter((i) => (!t || i.type === t) && S.stickers[i.id]).length;

  /* ── biểu tượng ── */
  const I = {
    star: (on = true) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#F2BE4A' : '#E0D5C3'}" stroke="${on ? '#B07A22' : '#CFC3AE'}" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
    sound: (on) => on ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>`,
    speak: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`,
    sticker: (t) => `<svg class="sticker" viewBox="0 0 40 40" aria-label="Đã sưu tầm"><circle cx="20" cy="20" r="18" fill="${{ 'thanh-ngu': '#3E7A47', 'tuc-ngu': '#A0622A', 'ca-dao': '#BE5A48' }[t]}" stroke="#FFFDF8" stroke-width="3"/><path d="M20 9l3.2 6.6 7.2.9-5.3 4.9 1.4 7.1L20 25l-6.5 3.5 1.4-7.1-5.3-4.9 7.2-.9z" fill="#F6D36B"/></svg>`,
    basket: (c) => `<svg viewBox="0 0 44 34" aria-hidden="true"><path d="M4 12h36l-4 20H8z" fill="${c}"/><path d="M8 12q14 -18 28 0" stroke="${c}" stroke-width="3" fill="none"/><path d="M10 18h24M11 24h22" stroke="#FFFDF8" stroke-width="2" opacity=".6"/></svg>`
  };
  const G_ICON = {
    'dien-tu': `<svg viewBox="0 0 28 28" fill="none" stroke="#3E7A47" stroke-width="2.6" stroke-linecap="round"><path d="M3 20h6M12 20h4M19 20h6"/><path d="M12 24h4" stroke="#DDAA55" stroke-width="3.4"/><path d="M16 4l5 5-9 9H7v-5z" fill="#E2EED8"/></svg>`,
    'xep-chu': `<svg viewBox="0 0 28 28"><rect x="2" y="15" width="10" height="9" rx="2" fill="#C68B59"/><rect x="14" y="15" width="12" height="9" rx="2" fill="#DDAA55"/><rect x="7" y="4" width="12" height="9" rx="2" fill="#6FA86A"/></svg>`,
    'noi-cau': `<svg viewBox="0 0 28 28" fill="none" stroke-width="2.6" stroke-linecap="round"><rect x="2" y="4" width="9" height="7" rx="2" fill="#F3DFB4" stroke="#C68B59"/><rect x="17" y="17" width="9" height="7" rx="2" fill="#F9DED3" stroke="#BE5A48"/><path d="M11 8q8 0 6 12" stroke="#3A3B3C" stroke-dasharray="2 3"/></svg>`,
    'tham-tu': `<svg viewBox="0 0 28 28" fill="none" stroke-width="2.8" stroke-linecap="round"><circle cx="12" cy="12" r="7.5" fill="#DCEEF0" stroke="#3A3B3C"/><path d="M18 18l7 7" stroke="#C68B59" stroke-width="4"/><path d="M9 10q3-3 6 0" stroke="#7FB3D9"/></svg>`,
    'phan-loai': `<svg viewBox="0 0 28 28"><path d="M1 14h8l-1 10H2z" fill="#3E7A47"/><path d="M10 14h8l-1 10h-6z" fill="#A0622A"/><path d="M19 14h8l-1 10h-6z" fill="#BE5A48"/><rect x="9" y="3" width="10" height="7" rx="2" fill="#F6D36B"/></svg>`,
    'tim-van': `<svg viewBox="0 0 28 28" fill="none" stroke-linecap="round"><path d="M4 20q10 -16 20 0" stroke="#BE5A48" stroke-width="2.6" stroke-dasharray="3 3"/><circle cx="4" cy="21" r="3.5" fill="#BE5A48"/><circle cx="24" cy="21" r="3.5" fill="#BE5A48"/><path d="M12 9V3l6-1v6" stroke="#3A3B3C" stroke-width="2"/></svg>`,
    'lat-the': `<svg viewBox="0 0 28 28"><rect x="3" y="6" width="12" height="16" rx="3" fill="#DDAA55" transform="rotate(-10 9 14)"/><rect x="13" y="6" width="12" height="16" rx="3" fill="#FFFDF8" stroke="#6FA86A" stroke-width="2" transform="rotate(8 19 14)"/><circle cx="19" cy="14" r="3" fill="#EE9DA9"/></svg>`
  };
  const GAMES = [
    { id: 'dien-tu', name: 'Điền từ', bg: 'var(--tn-bg)', desc: 'Chọn tiếng còn thiếu để câu đúng như lời ông bà.', en: 'Choose the missing word so the saying is complete.', kinds: true },
    { id: 'xep-chu', name: 'Xếp chữ', bg: 'var(--tg-bg)', desc: 'Bấm các tiếng theo đúng thứ tự để xếp lại câu.', en: 'Tap the words in the right order to rebuild the saying.', kinds: true },
    { id: 'noi-cau', name: 'Nối câu', bg: 'var(--straw-l)', desc: 'Bấm nửa đầu bên trái, rồi bấm nửa sau bên phải.', en: 'Tap a first half on the left, then its second half on the right.', kinds: true },
    { id: 'tham-tu', name: 'Thám tử tình huống', bg: 'var(--sky)', desc: 'Đọc câu chuyện nhỏ rồi chọn câu hợp nhất.', en: 'Read a short story, then choose the saying that fits it best.', kinds: true },
    { id: 'phan-loai', name: 'Phân loại', bg: 'var(--paper-2)', desc: 'Câu này là thành ngữ, tục ngữ hay ca dao?', en: 'Is it an idiom (thành ngữ), a proverb (tục ngữ) or a folk poem (ca dao)?', kinds: false },
    { id: 'tim-van', name: 'Tìm vần', bg: 'var(--cd-bg)', desc: 'Tìm tiếng có vần giống tiếng được tô màu trong thơ lục bát.', en: 'Find the word that rhymes with the highlighted word in the lục bát poem.', kinds: false },
    { id: 'lat-the', name: 'Lật thẻ', bg: 'var(--tn-bg)', desc: 'Lật hai thẻ một lượt, ghép tranh với câu.', en: 'Flip two cards at a time and match each picture with its saying.', kinds: true }
  ];

  /* ── Trâu Con nói ("mình" – "các bạn") ── */
  const SAY = {
    ok: ['Giỏi quá! Các bạn đúng rồi!', 'Tuyệt vời! Mình biết các bạn làm được mà!', 'Chính xác! Các bạn đọc hiểu giỏi ghê!', 'Hay lắm! Mình vui quá đi!'],
    bad: ['Chưa đúng rồi. Các bạn đọc lại thật chậm rồi thử lần nữa nhé!', 'Gần đúng rồi! Các bạn thử lại nhé, mình tin các bạn!', 'Ồ, chưa phải. Các bạn nghĩ thêm chút nữa nhé!']
  };

  /* ── âm thanh nhỏ ── */
  let actx;
  function tone(freqs, dur = 0.12, type = 'sine', gap = 0.09, vol = 0.16) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = actx.currentTime + 0.01;
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + i * gap); g.gain.exponentialRampToValueAtTime(vol, t0 + i * gap + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * gap + dur);
        o.connect(g); g.connect(actx.destination); o.start(t0 + i * gap); o.stop(t0 + i * gap + dur + 0.05);
      });
    } catch (e) { /* không có âm thanh */ }
  }
  const sfx = { ok: () => tone([660, 880]), bad: () => tone([240, 190], 0.2, 'triangle'), flip: () => tone([540], 0.06, 'triangle', 0, 0.1), win: () => tone([523, 659, 784, 1047], 0.2, 'sine', 0.12), pop: () => tone([720, 960], 0.08, 'sine', 0.06, 0.12) };

  /* ── đọc to ── */
  let voices = [];
  const loadVoices = () => { try { voices = speechSynthesis.getVoices(); } catch (e) { voices = []; } };
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(it) {
    if (D.AUDIO && D.AUDIO[it.id]) { new Audio(`audio/${it.id}.mp3`).play().catch(() => {}); return; }
    if (!('speechSynthesis' in window)) { toast('Trình duyệt này chưa đọc to được. Các bạn đọc to cùng bố mẹ nhé!'); return; }
    loadVoices();
    const v = voices.find((x) => /^vi/i.test(x.lang));
    if (!v) { toast('Máy này chưa có giọng đọc tiếng Việt. Các bạn đọc to cùng bố mẹ nhé!'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(it.text || it.lines.join(', '));
    u.voice = v; u.lang = v.lang; u.rate = 0.82;
    speechSynthesis.speak(u);
  }

  let toastT;
  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200); }
  function confetti(n = 36) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cols = ['#DDAA55', '#6FA86A', '#F2B28F', '#BE5A48', '#7FB3D9', '#F6D36B'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = rand(cols); c.style.animationDelay = Math.random() * 0.4 + 's'; c.style.animationDuration = 1.2 + Math.random() * 0.9 + 's';
      document.body.appendChild(c); setTimeout(() => c.remove(), 2600);
    }
  }

  /* ── thanh trên ── */
  function updateTop() {
    const s = document.getElementById('star-count'); if (s) s.textContent = S.stars;
    const b = document.getElementById('sound-btn'); if (b) { b.innerHTML = I.sound(S.sound); b.setAttribute('aria-label', S.sound ? 'Tắt tiếng' : 'Bật tiếng'); }
  }
  function setNav(route) {
    const key = route.startsWith('cau-') ? (byId[route.slice(4)] || {}).type : route.startsWith('choi-') ? 'tro-choi' : route || 'trang-dau';
    const nav = document.querySelector('.nav');
    document.querySelectorAll('.nav a').forEach((a) => { if (a.dataset.r === key) { a.setAttribute('aria-current', 'page'); if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft = a.offsetLeft - nav.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2; } else a.removeAttribute('aria-current'); });
  }

  /* ── phần dùng chung ── */
  const enBtn = (id, label = 'EN') => `<button class="en-btn" data-act="en" data-target="${id}" aria-expanded="false" aria-controls="${id}" title="Giải thích bằng tiếng Anh">${label}</button>`;
  const meter = (got, total) => `<div class="meter"><div class="bar"><i style="width:${Math.round(got / total * 100)}%"></i></div><span>${got}/${total}</span></div>`;
  const cardHTML = (it) => `<a class="card" href="#cau-${it.id}" style="${cvars(it.type)}" data-text="${esc((it.text || it.lines.join(' ')).toLowerCase())}">
      <div class="pic">${ART.scene(it.id)}</div><span class="num">${numIn(it)}</span>${S.stickers[it.id] ? I.sticker(it.type) : ''}
      <div class="t">${esc(firstLine(it))}${it.lines ? `<small>${esc(it.lines[1])}${it.lines.length > 2 ? ' …' : ''}</small>` : ''}</div></a>`;

  /* ── TRANG ĐẦU ── */
  function viewHome() {
    const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
    const today = ITEMS[(day * 7) % ITEMS.length];
    const chest = (t, art) => { const T = TYPES[t]; return `<a class="chest" href="#${t}" style="${cvars(t)}"><div class="pic">${ART.scene(art)}</div><div class="body"><h3>${T.name}</h3><p class="tag">${T.short}</p><p class="def">${T.def}</p>${meter(nStick(t), ofType(t).length)}</div></a>`; };
    return `<section class="hero">
        <div><p class="eyebrow">Góc đọc hiểu · Trường Tiếng Việt Của Em</p>
          <h1>Kho Báu <span>Lời Ông Bà</span></h1>
          <p class="lead">Thành ngữ, tục ngữ, ca dao là những lời hay ý đẹp ông bà để lại. Các bạn cùng Trâu Con đọc, hiểu nghĩa và chơi để sưu tầm đủ 60 viên ngọc nhé!</p>
          <div class="row"><a class="btn primary" href="#thanh-ngu">Mở kho báu</a><a class="btn" href="#tro-choi">Vào chơi ngay</a></div></div>
        <figure class="hero-trau"><div class="say-bubble">Chào các bạn! Mình là Trâu Con. Mình cùng khám phá lời ông bà nhé!</div><img src="${IMG('wave')}" alt="Trâu Con vẫy tay chào"></figure>
      </section>
      <section class="section"><div class="section-head"><h2>Ba kho báu</h2><p>Mỗi kho 20 câu. Đọc xong một câu, làm 4 bài luyện tập nhỏ để cất câu vào Sổ sưu tầm.</p></div>
        <div class="chests">${chest('thanh-ngu', 'tn01')}${chest('tuc-ngu', 'tg04')}${chest('ca-dao', 'cd15')}</div></section>
      <section class="section"><div class="section-head"><h2>Ba anh em khác nhau thế nào?</h2>${enBtn('cmp-en')}</div>
        <div class="compare">
          <div class="cmp" style="${cvars('thanh-ngu')}"><h3>Thành ngữ</h3><div class="diagram"><p class="sent">Em chạy <span class="chip">nhanh như sóc</span>.</p><p class="note">Một cụm từ, ghép vào câu của mình</p></div><p class="rule">Ngắn, chưa thành câu. Dùng để <b>tả</b> người, tả việc cho sinh động.</p></div>
          <div class="cmp" style="${cvars('tuc-ngu')}"><h3>Tục ngữ</h3><div class="diagram"><p class="sent"><span class="chip">Có chí thì nên.</span></p><p class="note">Một câu trọn ý, đứng một mình được</p></div><p class="rule">Là <b>kinh nghiệm</b> hoặc <b>lời khuyên</b> ông bà dạy lại.</p></div>
          <div class="cmp" style="${cvars('ca-dao')}"><h3>Ca dao</h3><div class="diagram"><div class="dots">${[1, 2, 3, 4, 5, 6].map((k) => `<i class="${k === 6 ? 'r' : ''}">${k}</i>`).join('')}<b>6 tiếng</b></div><div class="dots">${[1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<i class="${k === 6 ? 'r' : ''}">${k}</i>`).join('')}<b>8 tiếng</b></div><p class="note">Hai tiếng tô màu có vần với nhau</p></div><p class="rule">Là <b>thơ lục bát</b>, có vần, có thể hát ru. Nói về gia đình, quê hương.</p></div>
        </div>
        <div class="en-text" id="cmp-en" hidden><p><b>Thành ngữ (idiom):</b> ${TYPES['thanh-ngu'].defEn}</p><p><b>Tục ngữ (proverb):</b> ${TYPES['tuc-ngu'].defEn}</p><p><b>Ca dao (folk poem):</b> ${TYPES['ca-dao'].defEn}</p></div>
      </section>
      <section class="section"><div class="section-head"><h2>Câu hay hôm nay</h2></div>
        <a class="today" href="#cau-${today.id}" style="${cvars(today.type)}"><div class="pic">${ART.scene(today.id)}</div><div class="body"><span class="kind">${TYPES[today.type].name}</span><p class="say-text">${(today.text ? esc(today.text) : today.lines.map(esc).join('<br>'))}</p><p>${esc(today.nghia)}</p><span class="btn small" style="align-self:flex-start">Đọc tiếp</span></div></a></section>
      <section class="section"><div class="section-head"><h2>Bảy trò chơi</h2><p>Mỗi lượt chơi được tới 3 ngôi sao.</p></div><div class="games">${GAMES.map(gameCard).join('')}<a class="game-card" href="#so-suu-tam"><span class="gi" style="--gbg:var(--straw-l)">${I.star()}</span><span><h3>Sổ sưu tầm</h3><p>Xem các viên ngọc, ngôi sao và huy hiệu các bạn đã có.</p></span></a></div></section>`;
  }
  const gameCard = (g) => `<a class="game-card" href="#choi-${g.id}"><span class="gi" style="--gbg:${g.bg}">${G_ICON[g.id]}</span><span><h3>${g.name}</h3><p>${g.desc}</p>${S.best[g.id] ? `<span class="best">${[1, 2, 3].map((k) => I.star(k <= S.best[g.id])).join('')}</span>` : ''}</span></a>`;

  /* ── KHO ── */
  function viewLib(t) {
    const T = TYPES[t], list = ofType(t);
    return `<section class="lib-head" style="${cvars(t)}"><div><p class="crumbs"><a href="#">Trang đầu</a> › Kho báu</p><h1>${T.name}</h1><p class="def">${T.def}</p>
        <div class="row" style="margin-top:12px">${enBtn('lib-en')}<div style="flex:1;min-width:160px;max-width:300px">${meter(nStick(t), list.length)}</div></div><p class="en-text" id="lib-en" hidden>${T.defEn}</p></div>
        <img src="${IMG(t === 'ca-dao' ? 'listening' : t === 'tuc-ngu' ? 'thinking' : 'reading')}" alt=""></section>
      <div class="lib-tools"><label class="search">${I.search}<input id="q" type="search" placeholder="Tìm câu… (ví dụ: nước, trâu)" aria-label="Tìm câu"></label>
        <a class="btn small" href="#choi-dien-tu" data-act="play-kho" data-kho="${t}">Chơi với kho này</a></div>
      <div class="cards" id="cards">${list.map(cardHTML).join('')}</div><p class="empty" id="none" hidden>Chưa tìm thấy câu nào. Các bạn thử từ khác nhé!</p>`;
  }

  /* ── MỘT CÂU ── */
  function viewItem(id) {
    const it = byId[id]; if (!it) return viewHome();
    const T = TYPES[it.type], list = ofType(it.type), k = list.indexOf(it), prev = list[k - 1], next = list[k + 1];
    let say;
    if (it.lines) {
      const rh = rhymePairs(it);
      say = `<div class="poem" id="poem">${it.lines.map((l, li) => `<div class="ln ${l.split(' ').length === 6 ? 'l6' : 'l8'}">${l.split(' ').map((w, wi) => { const r = rh[li + ':' + wi]; return `<span class="syl${r ? ' rh' : ''}" ${r ? `style="--rh:${r}"` : ''}>${esc(w)}<span class="no">${wi + 1}</span></span>`; }).join('')}</div>`).join('')}</div>
        <p class="rh-legend counting-only">Thơ lục bát: dòng 6 tiếng, dòng 8 tiếng. Tiếng thứ 6 của dòng 6 vần với tiếng thứ 6 của dòng 8; tiếng thứ 8 lại vần với tiếng thứ 6 của dòng sau. Những tiếng cùng màu là vần với nhau.</p>`;
    } else {
      say = `<p class="big-say">${esc(it.text)}</p><div class="chips" id="chips">${it.words.map(([vi, en]) => `<button class="chip-w" data-act="chip" aria-pressed="false">${esc(vi)}<small>${esc(en)}</small></button>`).join('')}</div>`;
    }
    const blocks = [];
    if (it.den) blocks.push(`<div class="blk"><h3>Nghĩa đen</h3><p>${esc(it.den)}</p></div>`);
    blocks.push(`<div class="blk main"><h3>${it.den ? 'Nghĩa bóng' : 'Ý nghĩa'}</h3><p>${esc(it.nghia)}</p></div>`);
    if (it.hard) blocks.push(`<div class="blk"><h3>Từ khó</h3><ul class="hard">${it.hard.map(([w, m]) => `<li><b>${esc(w)}:</b> ${esc(m)}</li>`).join('')}</ul></div>`);
    blocks.push(`<div class="blk"><h3>Ví dụ</h3><p>${esc(it.vidu)}</p></div>`);
    const got = !!S.stickers[it.id];
    return `<p class="crumbs"><a href="#">Trang đầu</a> › <a href="#${it.type}">${T.name}</a> › Câu ${k + 1}/${list.length}</p>
      <div class="detail" style="${cvars(it.type)}">
        <div class="art">${ART.scene(it.id)}</div>
        <div id="detail-body">
          <span class="kind">${T.name}</span>
          ${say}
          <div class="row"><button class="btn small" data-act="speak" data-id="${it.id}">${I.speak} Nghe đọc</button>${it.lines ? `<button class="btn small" data-act="count" aria-pressed="false">Đếm tiếng &amp; tìm vần</button>` : `<button class="btn small" data-act="all-en" aria-pressed="false">Hiện nghĩa từng tiếng</button>`}${enBtn('item-en', 'English')}</div>
          <div class="en-text" id="item-en" hidden><p>${esc(it.en)}</p><p style="margin-top:6px"><b>Similar in English:</b> ${esc(it.enEq)}</p></div>
          <div class="blocks">${blocks.join('')}</div>
          <div class="collect" id="collect">${collectInner(it, got)}</div>
          <nav class="pager">${prev ? `<a class="btn small" href="#cau-${prev.id}">‹ Câu trước</a>` : '<span></span>'}${next ? `<a class="btn small" href="#cau-${next.id}">Câu sau ›</a>` : `<a class="btn small" href="#tro-choi">Chơi trò chơi ›</a>`}</nav>
        </div>
      </div>`;
  }
  const collectInner = (it, got) => {
    const best = S.practice[it.id] || 0;
    return `<img src="${IMG(got ? 'thumbs-up' : 'peeking')}" alt=""><div class="txt"><b>Luyện tập 4 bài nhỏ</b>
      <span class="sub">Điền từ · Xếp câu · Hiểu nghĩa · Chọn tranh</span>
      <span class="sub">${got ? 'Câu này đã có trong Sổ sưu tầm. Luyện lại để nhớ lâu hơn nhé!' : 'Đọc xong rồi? Các bạn làm 4 bài nhỏ để cất câu này vào Sổ sưu tầm nhé!'}</span>
      ${best ? `<span class="mini-stars" aria-label="Kết quả tốt nhất ${best} sao">${[1, 2, 3].map((k) => I.star(k <= best)).join('')}</span>` : ''}</div>
      <button class="btn primary" data-act="p-open" data-id="${it.id}">${got ? 'Luyện lại' : 'Bắt đầu luyện tập'}</button>`;
  };

  /* ── LUYỆN TẬP sau mỗi câu: Điền từ · Xếp câu · Hiểu nghĩa · Chọn tranh ── */
  const P_STEPS = [
    { key: 'dien', name: 'Điền từ', ask: 'Chọn tiếng còn thiếu trong câu.', en: 'Choose the missing word.' },
    { key: 'xep', name: 'Xếp câu', ask: 'Bấm các tiếng theo đúng thứ tự để xếp lại câu.', en: 'Tap the words in the right order to rebuild the saying.' },
    { key: 'nghia', name: 'Hiểu nghĩa', ask: 'Câu này có nghĩa là gì? Chọn cách giải thích đúng.', en: 'What does this saying mean? Choose the correct explanation.' },
    { key: 'tranh', name: 'Chọn tranh', ask: 'Tranh nào đúng với câu này?', en: 'Which picture matches this saying?' }
  ];
  const lastSentence = (s) => { const p = s.split(/(?<=[.!?])\s+/); return p[p.length - 1]; };
  const shortMeaning = (it) => (it.lines ? lastSentence(it.nghia) : it.nghia);
  function distract(it, n) {
    const ok = ITEMS.filter((o) => o.id !== it.id && !o.tags.some((t) => it.tags.includes(t)));
    return shuffle(ok.filter((o) => o.type === it.type)).concat(shuffle(ok.filter((o) => o.type !== it.type))).slice(0, n);
  }
  const orderSource = (it) => (it.lines ? it.lines[0] : it.text.split(' ').length <= 9 ? it.text : it.halves[0]);
  let P = null;
  function newPractice(id) {
    const it = byId[id], ans = bare(tokAt(it, it.blank.at)), target = orderSource(it).split(' ').map(bare);
    let tiles; do { tiles = shuffle(target.map((t) => ({ t }))); } while (tiles.length > 1 && tiles.every((x, k) => x.t === target[k]));
    P = {
      id, step: 0, score: 0, first: true, solved: false, wrong: new Set(), done: false, stars: 0,
      dien: { ans, opts: shuffle([ans, ...it.blank.opts]) },
      xep: { target, tiles, ans: [], part: it.lines ? 'Dòng đầu của bài ca dao' : orderSource(it) !== it.text ? 'Nửa đầu của câu' : '' },
      nghia: shuffle([it, ...distract(it, 2)]).map((o) => ({ id: o.id, t: shortMeaning(o) })),
      tranh: shuffle([it.id, ...distract(it, 2).map((o) => o.id)]),
      say: 'Mình cùng luyện tập nhé! Các bạn đọc thật kỹ rồi chọn nha.', mood: 'reading'
    };
  }
  const sayingHTML = (it) => (it.lines ? it.lines.map((l) => `<span class="ln">${esc(l)}</span>`).join('') : esc(it.text));
  function practiceHTML() {
    const it = byId[P.id], st = P_STEPS[P.step], list = ofType(it.type), next = list[list.indexOf(it) + 1];
    const steps = `<ol class="steps">${P_STEPS.map((s, k) => `<li class="${P.done || k < P.step ? 'done' : k === P.step ? 'on' : ''}"><b>${k + 1}</b> ${s.name}</li>`).join('')}</ol>`;
    let body;
    if (P.done) {
      body = `<div class="end"><img src="${IMG(P.stars === 3 ? 'cheer' : 'thumbs-up')}" alt="Trâu Con"><h2>${P.stars === 3 ? 'Xuất sắc! Các bạn đúng hết ngay lần đầu!' : P.stars === 2 ? 'Giỏi lắm! Các bạn hoàn thành rồi!' : 'Hoàn thành rồi! Luyện lại để được 3 sao nhé!'}</h2>
        <div class="stars">${[1, 2, 3].map((k) => I.star(k <= P.stars)).join('')}</div>
        <p>Câu <b>${esc(firstLine(it))}</b> đã nằm trong Sổ sưu tầm của các bạn.</p>
        <div class="row"><button class="btn" data-act="p-again">Luyện lại</button>${next ? `<button class="btn primary" data-act="p-go" data-id="${next.id}">Sang câu sau ›</button>` : `<button class="btn primary" data-act="p-go" data-id="">Về kho ${esc(TYPES[it.type].name)}</button>`}<button class="btn" data-act="p-close">Đóng</button></div></div>`;
    } else {
      const head = `<div class="px-ask"><p>${st.ask}</p>${enBtn('px-en')}</div><p class="en-text" id="px-en" hidden>${st.en}</p>`;
      let q = '';
      if (st.key === 'dien') {
        const lines = (it.lines || [it.text]).map((l, li) => `<span class="ln">${l.split(' ').map((w, wi) => li === it.blank.at[0] && wi === it.blank.at[1] ? `<span class="blank${P.solved ? ' filled' : ''}">${P.solved ? esc(w) : '&nbsp;'}</span>` : esc(w)).join(' ')}</span>`).join('');
        q = `<p class="q-text${it.lines ? ' poem-q' : ''}">${lines}</p><div class="opts">${P.dien.opts.map((o) => `<button class="opt${P.wrong.has(o) ? ' wrong' : ''}${P.solved && o === P.dien.ans ? ' right' : ''}" data-act="p-ans" data-v="${esc(o)}" ${P.solved || P.wrong.has(o) ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>`;
      } else if (st.key === 'xep') {
        const x = P.xep;
        q = `${x.part ? `<p class="px-note">${x.part}</p>` : ''}<div class="tiles answer${P.solved ? ' ok' : ''}" id="px-ansrow">${x.ans.map((k, pos) => `<button class="tile in" data-act="p-untile" data-pos="${pos}" ${P.solved ? 'disabled' : ''}>${esc(x.tiles[k].t)}</button>`).join('') || '<span class="px-hint">Bấm các tiếng bên dưới…</span>'}</div>
          ${P.solved ? '' : `<div class="tiles">${x.tiles.map((t, k) => `<button class="tile${x.ans.includes(k) ? ' used' : ''}" data-act="p-tile" data-k="${k}">${esc(t.t)}</button>`).join('')}</div>
          <div class="next-row"><button class="btn small" data-act="p-hint">Gợi ý một tiếng</button></div>`}`;
      } else if (st.key === 'nghia') {
        q = `<p class="q-text${it.lines ? ' poem-q' : ''}">${sayingHTML(it)}</p><div class="opts col">${P.nghia.map((o) => `<button class="opt long${P.wrong.has(o.id) ? ' wrong' : ''}${P.solved && o.id === it.id ? ' right' : ''}" data-act="p-ans" data-v="${o.id}" ${P.solved || P.wrong.has(o.id) ? 'disabled' : ''}>${esc(o.t)}</button>`).join('')}</div>`;
      } else {
        q = `<p class="q-text${it.lines ? ' poem-q' : ''}">${sayingHTML(it)}</p><div class="pics">${P.tranh.map((id, k) => `<button class="pic-opt${P.wrong.has(id) ? ' wrong' : ''}${P.solved && id === it.id ? ' right' : ''}" data-act="p-ans" data-v="${id}" aria-label="Tranh ${k + 1}" ${P.solved || P.wrong.has(id) ? 'disabled' : ''}>${ART.scene(id)}</button>`).join('')}</div>`;
      }
      body = `${head}<div class="px-q">${q}</div>
        ${P.solved ? `<div class="next-row"><button class="btn primary" data-act="p-next">${P.step < 3 ? 'Bài tiếp ›' : 'Xem kết quả'}</button></div>` : ''}
        <div class="trau-say"><img src="${IMG(P.mood)}" alt="Trâu Con"><p aria-live="polite">${esc(P.say)}</p></div>`;
    }
    return `<div class="px-box" role="dialog" aria-modal="true" aria-labelledby="px-title"><div class="px-head"><h2 id="px-title">Luyện tập: ${esc(firstLine(it))}</h2><button class="px-close" data-act="p-close" aria-label="Đóng">×</button></div>${steps}${body}</div>`;
  }
  function drawPx(shakeSel) {
    const px = document.getElementById('px'); px.innerHTML = practiceHTML();
    if (shakeSel) { const el = px.querySelector(shakeSel); if (el) { void el.offsetWidth; el.classList.add('shake'); } }
  }
  function openPx() {
    let px = document.getElementById('px');
    if (!px) { px = document.createElement('div'); px.id = 'px'; px.className = 'px'; document.body.appendChild(px); }
    px.hidden = false; document.documentElement.classList.add('px-open'); drawPx();
    const c = px.querySelector('.px-close'); if (c) c.focus({ preventScroll: true });
  }
  function closePx() {
    const px = document.getElementById('px'); if (px) { px.hidden = true; px.innerHTML = ''; }
    document.documentElement.classList.remove('px-open'); P = null;
    if (location.hash.startsWith('#cau-')) { const box = document.getElementById('collect'); const it = byId[location.hash.slice(5)]; if (box && it) box.innerHTML = collectInner(it, !!S.stickers[it.id]); }
  }
  function pSolve(ok, shakeSel) {
    if (ok) { P.solved = true; if (P.first) P.score++; P.say = rand(SAY.ok); P.mood = rand(['cheer', 'thumbs-up']); sfx.ok(); drawPx(); }
    else { P.first = false; P.say = rand(SAY.bad); P.mood = 'thinking'; sfx.bad(); drawPx(shakeSel); }
  }
  function pFinish() {
    P.done = true; P.stars = P.score === 4 ? 3 : P.score === 3 ? 2 : 1;
    if (!S.stickers[P.id]) S.stickers[P.id] = Date.now();
    S.practice[P.id] = Math.max(S.practice[P.id] || 0, P.stars); S.stars += P.stars; save();
    sfx.win(); confetti(P.stars * 15); drawPx();
  }
  function rhymePairs(it) {
    const cols = ['#F6D36B', '#B9D7A6', '#BFDCEB', '#F2C2D0'], out = {}; let c = 0;
    for (let i = 0; i < it.lines.length; i++) {
      const n = it.lines[i].split(' ').length;
      if (n === 6 && it.lines[i + 1]) { out[i + ':5'] = out[i + 1 + ':5'] = out[i + ':5'] || cols[c++ % 4]; }
      if (n === 8 && it.lines[i + 1]) { out[i + ':7'] = out[i + 1 + ':5'] = cols[c++ % 4]; }
    }
    return out;
  }

  /* ── SỔ SƯU TẦM ── */
  function viewBook() {
    const total = nStick();
    const badge = (on, title, sub, c) => `<div class="badge${on ? '' : ' off'}"><svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="${c}"/><path d="M23 9l4 8.4 9.2 1.1-6.8 6.3 1.8 9L23 29.4l-8.2 4.4 1.8-9-6.8-6.3 9.2-1.1z" fill="#F6D36B"/></svg><div><b>${title}</b><span>${sub}</span></div></div>`;
    return `<section class="book-head"><img src="${IMG(total >= 30 ? 'cheer' : 'reading')}" alt=""><div><h1>Sổ sưu tầm</h1><p>${total === 0 ? 'Sổ còn trống. Các bạn mở một kho báu, đọc một câu rồi làm 4 bài luyện tập nhỏ nhé.' : total === 60 ? 'Các bạn đã sưu tầm đủ 60 viên ngọc! Mình tự hào về các bạn lắm!' : `Các bạn đã có ${total} viên ngọc. Còn ${60 - total} viên nữa thôi!`}</p>
        <div class="stats"><span class="stat"><b>${total}</b>/60 câu</span><span class="stat"><b>${S.stars}</b> ngôi sao</span><span class="stat"><b>${S.played}</b> lượt chơi</span></div></div></section>
      <section class="section"><div class="section-head"><h2>Huy hiệu</h2></div><div class="badges">
        ${badge(nStick('thanh-ngu') === 20, 'Nhà thám hiểm Thành ngữ', 'Sưu tầm đủ 20 thành ngữ', '#3E7A47')}
        ${badge(nStick('tuc-ngu') === 20, 'Nhà thông thái Tục ngữ', 'Sưu tầm đủ 20 tục ngữ', '#A0622A')}
        ${badge(nStick('ca-dao') === 20, 'Nghệ sĩ Ca dao', 'Sưu tầm đủ 20 ca dao', '#BE5A48')}
        ${badge(GAMES.every((g) => S.best[g.id]), 'Vua trò chơi', 'Chơi đủ cả 7 trò', '#7FB3D9')}
        ${badge(S.stars >= 50, 'Ngôi sao sáng', 'Đạt 50 ngôi sao', '#DDAA55')}</div></section>
      ${TK.map((t) => `<section class="section"><div class="section-head"><h2>${TYPES[t].name}</h2><p>${nStick(t)}/20</p></div><div class="slots">${ofType(t).map((it) => S.stickers[it.id]
        ? `<a class="slot got" href="#cau-${it.id}" style="${cvars(t)}"><div class="pic">${ART.scene(it.id)}</div><div class="t">${esc(firstLine(it))}</div></a>`
        : `<a class="slot" href="#cau-${it.id}"><div class="pic"><span class="q">?</span></div><div class="t">Câu ${numIn(it)}</div></a>`).join('')}</div></section>`).join('')}
      <section class="section"><p style="color:var(--muted)">Tiến độ được lưu trên máy này. Đổi máy khác sẽ bắt đầu lại từ đầu.</p>
        <div class="confirm" id="reset-box"><button class="btn small" data-act="reset-ask">Xóa tiến độ trên máy này</button></div></section>`;
  }

  /* ── TRÒ CHƠI ── */
  function viewGames() {
    return `<section class="lib-head" style="--c:var(--ink);--cbg:var(--card)"><div><p class="crumbs"><a href="#">Trang đầu</a> › Trò chơi</p><h1>Bảy trò chơi</h1><p class="def">Mỗi trò có 8 đến 12 câu. Trả lời đúng ngay lần đầu được tính điểm. Hết lượt, các bạn nhận tới 3 ngôi sao.</p></div><img src="${IMG('cheer')}" alt=""></section>
      <div class="games" style="margin-top:20px">${GAMES.map(gameCard).join('')}<a class="game-card" href="#so-suu-tam"><span class="gi" style="--gbg:var(--straw-l)">${I.star()}</span><span><h3>Sổ sưu tầm</h3><p>Xem các viên ngọc, ngôi sao và huy hiệu các bạn đã có.</p></span></a></div>`;
  }

  let G = null; // trạng thái trò chơi đang chơi
  const gdef = (id) => GAMES.find((g) => g.id === id);
  function pool(kho, filter) { return ITEMS.filter((i) => (kho === 'all' || i.type === kho) && (!filter || filter(i))); }

  const ENG = {
    'dien-tu': {
      init(g) { g.q = pick(pool(g.kho), 10).map((it) => ({ it, opts: shuffle([bare(tokAt(it, it.blank.at)), ...it.blank.opts]) })); },
      view(g) {
        const { it, opts } = g.q[g.i], ans = bare(tokAt(it, it.blank.at));
        const lines = (it.lines || [it.text]).map((l, li) => `<span class="ln">${l.split(' ').map((w, wi) => li === it.blank.at[0] && wi === it.blank.at[1] ? `<span class="blank${g.solved ? ' filled' : ''}">${g.solved ? esc(w) : '&nbsp;'}</span>` : esc(w)).join(' ')}</span>`).join('');
        return `<div class="q-grid"><div class="q-art">${ART.scene(it.id)}</div><div><span class="kind" style="${cvars(it.type)}">${TYPES[it.type].name}</span><p class="q-text${it.lines ? ' poem-q' : ''}" style="margin-top:10px">${lines}</p>
          <div class="opts">${opts.map((o) => `<button class="opt${g.wrong.has(o) ? ' wrong' : ''}${g.solved && o === ans ? ' right' : ''}" data-act="ans" data-v="${esc(o)}" ${g.solved || g.wrong.has(o) ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div></div></div>
          ${g.solved ? `<div class="reveal"><b>Nghĩa:</b> ${esc(it.nghia)}</div>${nextRow(g)}` : ''}`;
      },
      answer(g, v) { const it = g.q[g.i].it; return v === bare(tokAt(it, it.blank.at)); }
    },
    'xep-chu': {
      init(g) {
        g.q = pick(pool(g.kho, (i) => i.xep !== false && (i.lines ? true : i.text.split(' ').length <= 8)), 8).map((it) => {
          const target = (it.lines ? it.lines[0] : it.text).split(' ').map(bare);
          let tiles; do { tiles = shuffle(target.map((t, k) => ({ t, k }))); } while (tiles.length > 1 && tiles.every((x, k) => x.t === target[k]));
          return { it, target, tiles, ans: [] };
        });
      },
      view(g) {
        const q = g.q[g.i], it = q.it;
        return `<div class="q-grid"><div class="q-art">${ART.scene(it.id)}</div><div><span class="kind" style="${cvars(it.type)}">${TYPES[it.type].name}${it.lines ? ' · dòng đầu' : ''}</span><p style="margin-top:10px"><b>Gợi ý:</b> ${it.lines ? `Dòng sau của bài là: <i>${esc(it.lines[1])}</i>` : esc(it.den || it.nghia)}</p></div></div>
          <div class="tiles answer${g.solved ? ' ok' : ''}" id="ansrow" aria-label="Câu của các bạn">${q.ans.map((k, pos) => `<button class="tile in" data-act="untile" data-pos="${pos}" ${g.solved ? 'disabled' : ''}>${esc(q.tiles[k].t)}</button>`).join('') || '<span style="color:var(--muted);font-weight:700;padding:10px">Bấm các tiếng bên dưới…</span>'}</div>
          ${g.solved ? '' : `<div class="tiles">${q.tiles.map((x, k) => `<button class="tile${q.ans.includes(k) ? ' used' : ''}" data-act="tile" data-k="${k}">${esc(x.t)}</button>`).join('')}</div>`}
          ${g.solved ? `<div class="reveal"><b>${esc(firstLine(it))}</b><br>${esc(it.nghia)}</div>${nextRow(g)}` : `<div class="next-row"><button class="btn small" data-act="hint">Gợi ý một tiếng</button></div>`}`;
      }
    },
    'noi-cau': {
      init(g) {
        const all = pick(pool(g.kho, (i) => !!(i.halves || i.lines)), 8);
        g.rounds = [all.slice(0, 4), all.slice(4, 8)].filter((r) => r.length);
        g.n = g.rounds.length; g.q = g.rounds; g.missed = new Set(); g.score = 0; this.round(g);
      },
      round(g) { const r = g.rounds[g.i]; g.left = r; g.right = shuffle(r); g.done = {}; g.sel = null; g.bad = null; },
      halves: (it) => it.halves || [it.lines[0], it.lines[1]],
      view(g) {
        const cols = [['var(--tn)', 'var(--tn-bg)'], ['var(--tg)', 'var(--tg-bg)'], ['var(--cd)', 'var(--cd-bg)'], ['#3D7FA6', 'var(--sky)']];
        const st = (id) => { const c = g.done[id]; return c === undefined ? '' : `style="--mc:${cols[c][0]};--mbg:${cols[c][1]}"`; };
        const fin = Object.keys(g.done).length === g.left.length;
        return `<p class="ask" style="margin-top:0">Lượt ${g.i + 1}/${g.n}: nối ${g.left.length} cặp</p><div class="pairs" style="margin-top:12px">
          <div class="col">${g.left.map((it) => `<button class="p${g.done[it.id] !== undefined ? ' done' : ''}${g.sel === it.id ? ' sel' : ''}" ${st(it.id)} data-act="L" data-id="${it.id}" ${g.done[it.id] !== undefined ? 'disabled' : ''}>${esc(this.halves(it)[0])}</button>`).join('')}</div>
          <div class="col">${g.right.map((it) => `<button class="p${g.done[it.id] !== undefined ? ' done' : ''}${g.bad === it.id ? ' wrong shake' : ''}" ${st(it.id)} data-act="R" data-id="${it.id}" ${g.done[it.id] !== undefined ? 'disabled' : ''}>${esc(this.halves(it)[1])}</button>`).join('')}</div></div>
          ${fin ? nextRow(g, g.i + 1 < g.n ? 'Lượt tiếp' : 'Xem kết quả') : ''}`;
      }
    },
    'tham-tu': {
      init(g) {
        const P = pool(g.kho);
        g.q = pick(P, 8).map((it) => {
          const others = shuffle((g.kho === 'all' ? ITEMS : P).filter((o) => o.id !== it.id && !o.tags.some((t) => it.tags.includes(t))));
          return { it, opts: shuffle([it, ...others.slice(0, 2)]) };
        });
      },
      view(g) {
        const { it, opts } = g.q[g.i];
        return `<div class="story-h"><img src="${IMG('reading')}" alt=""><h2 style="font-size:1.2rem">Chuyện nhỏ số ${g.i + 1}</h2></div><p class="story">${esc(it.story)}</p>
          <p class="ask">Câu nào hợp với câu chuyện này nhất?</p>
          <div class="opts col">${opts.map((o) => `<button class="opt long${g.wrong.has(o.id) ? ' wrong' : ''}${g.solved && o.id === it.id ? ' right' : ''}" data-act="ans" data-v="${o.id}" ${g.solved || g.wrong.has(o.id) ? 'disabled' : ''}>${esc(twoLines(o))}</button>`).join('')}</div>
          ${g.solved ? `<div class="reveal"><b>Vì sao?</b> ${esc(it.nghia)}</div>${nextRow(g)}` : ''}`;
      },
      answer(g, v) { return v === g.q[g.i].it.id; }
    },
    'phan-loai': {
      init(g) { g.q = shuffle(TK.flatMap((t) => pick(ofType(t).filter((i) => i.sort !== false), 4))).map((it) => ({ it })); },
      why: { 'thanh-ngu': 'Đây là thành ngữ: một cụm từ ngắn, mình ghép vào câu để tả người, tả việc.', 'tuc-ngu': 'Đây là tục ngữ: một câu trọn ý, nói lên kinh nghiệm hoặc lời khuyên.', 'ca-dao': 'Đây là ca dao: thơ lục bát, có dòng 6 tiếng và dòng 8 tiếng, có vần với nhau.' },
      view(g) {
        const { it } = g.q[g.i];
        return `<p class="sort-card">${it.lines ? it.lines.slice(0, 2).map(esc).join('<br>') : esc(it.text)}</p>
          <div class="baskets">${TK.map((t) => `<button class="basket${g.wrong.has(t) ? ' wrong' : ''}${g.solved && t === it.type ? ' right' : ''}" style="${cvars(t)}" data-act="ans" data-v="${t}" ${g.solved || g.wrong.has(t) ? 'disabled' : ''}>${I.basket(`var(--${CV[t]})`)}${TYPES[t].name}<small>${TYPES[t].short}</small></button>`).join('')}</div>
          ${g.solved ? `<div class="reveal">${this.why[it.type]}</div>${nextRow(g)}` : g.wrong.size ? `<div class="reveal" style="background:var(--bad-bg)">Gợi ý: ${it.lines ? 'Câu này có hai dòng thơ, một dòng 6 tiếng và một dòng 8 tiếng.' : it.type === 'tuc-ngu' ? 'Câu này đứng một mình đã trọn ý, như một lời khuyên.' : 'Câu này là một cụm từ ngắn, mình hay ghép vào câu nói để tả.'}</div>` : ''}`;
      },
      answer(g, v) { return v === g.q[g.i].it.type; }
    },
    'tim-van': {
      init(g) { g.q = pick(ITEMS.filter((i) => i.rhyme), 8).map((it) => ({ it, opts: shuffle([bare(tokAt(it, it.rhyme.hide)), ...it.rhyme.opts]) })); },
      view(g) {
        const { it, opts } = g.q[g.i], R = it.rhyme, partner = bare(tokAt(it, R.with)), ans = bare(tokAt(it, R.hide));
        const lines = it.lines.map((l, li) => `<span class="ln">${l.split(' ').map((w, wi) => {
          if (li === R.hide[0] && wi === R.hide[1]) return `<span class="blank${g.solved ? ' filled' : ''}">${g.solved ? esc(w) : '&nbsp;'}</span>`;
          if (li === R.with[0] && wi === R.with[1]) return `<span class="hl${g.solved ? ' ok' : ''}">${esc(w)}</span>`;
          return esc(w);
        }).join(' ')}</span>`).join('');
        const rule = R.with[0] % 2 === 0 && R.hide[0] === R.with[0] + 1 ? 'Tiếng thứ 6 của dòng 6 vần với tiếng thứ 6 của dòng 8.' : 'Tiếng thứ 8 của dòng 8 vần với tiếng thứ 6 của dòng 6 tiếp theo.';
        return `<div class="q-grid"><div class="q-art">${ART.scene(it.id)}</div><div><p class="q-text poem-q">${lines}</p></div></div>
          <p class="ask">Tiếng nào có vần giống <span class="hl">${esc(partner)}</span>?</p>
          <div class="opts">${opts.map((o) => `<button class="opt${g.wrong.has(o) ? ' wrong' : ''}${g.solved && o === ans ? ' right' : ''}" data-act="ans" data-v="${esc(o)}" ${g.solved || g.wrong.has(o) ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
          ${g.solved ? `<div class="reveal"><b>${esc(partner)}</b> – <b>${esc(ans)}</b>: ${rule}</div>${nextRow(g)}` : ''}`;
      },
      answer(g, v) { const it = g.q[g.i].it; return v === bare(tokAt(it, it.rhyme.hide)); }
    },
    'lat-the': {
      init(g) {
        const P = pick(pool(g.kho), 6);
        g.cards = shuffle(P.flatMap((it) => [{ id: it.id, k: 'art' }, { id: it.id, k: 'txt' }]));
        g.q = P; g.n = P.length; g.found = 0; g.moves = 0; g.up = []; g.lock = false;
      },
      view(g) {
        return `<div class="memory" id="mem">${g.cards.map((c, k) => `<button class="mcard" data-act="flip" data-k="${k}" aria-label="Thẻ ${k + 1}"><span class="in"><span class="face front"><img src="${IMG('peeking')}" alt=""></span><span class="face back">${c.k === 'art' ? ART.scene(c.id) : esc(firstLine(byId[c.id]))}</span></span></button>`).join('')}</div>
          <p class="ask" id="moves">Số lần lật: ${g.moves}</p>`;
      }
    }
  };
  const tokAt = (it, at) => (it.lines || [it.text])[at[0]].split(' ')[at[1]];
  const nextRow = (g, label) => `<div class="next-row"><button class="btn primary" data-act="next">${label || (g.i + 1 < g.n ? 'Câu tiếp ›' : 'Xem kết quả')}</button></div>`;

  function newGame(id, kho) {
    const def = gdef(id); if (!def) return;
    G = { id, kho: def.kinds ? (kho || (G && G.kho) || 'all') : 'all', i: 0, score: 0, solved: false, wrong: new Set(), first: true, say: 'Các bạn sẵn sàng chưa? Mình bắt đầu nhé!', mood: 'wave', over: false };
    ENG[id].init(G);
    if (G.n === undefined) G.n = G.q.length;
  }
  function viewGame(id) {
    if (!G || G.id !== id) newGame(id);
    const def = gdef(id);
    const pct = Math.round(((G.over ? G.n : G.i) / G.n) * 100);
    const kp = def.kinds ? `<div class="kho-pick" role="group" aria-label="Chọn kho">${[['all', 'Cả ba kho'], ...TK.map((t) => [t, TYPES[t].name])].map(([k, l]) => `<button data-act="kho" data-kho="${k}" aria-pressed="${G.kho === k}">${l}</button>`).join('')}</div>` : '';
    const label = id === 'noi-cau' ? `Lượt ${Math.min(G.i + 1, G.n)}/${G.n}` : id === 'lat-the' ? `Đã ghép ${G.found}/${G.n} cặp` : `Câu ${Math.min(G.i + 1, G.n)}/${G.n}`;
    const body = G.over ? endView() : ENG[id].view(G);
    return `<section class="game"><div class="game-top"><a class="back" href="#tro-choi">‹ Trò chơi</a><h1>${def.name}</h1>${enBtn('g-en')}</div>
      <p class="game-help">${def.desc}</p><p class="en-text" id="g-en" hidden>${def.en}</p>${kp}
      <div class="progress"><span id="plabel">${G.over ? 'Xong!' : label}</span><div class="bar"><i id="pbar" style="width:${id === 'lat-the' ? Math.round(G.found / G.n * 100) : pct}%"></i></div><span class="sc">${I.star()} <span id="gscore">${G.score}</span></span></div>
      <div class="stage" id="stage">${body}</div>
      ${G.over ? '' : `<div class="trau-say"><img id="trau-img" src="${IMG(G.mood)}" alt="Trâu Con"><p id="say" aria-live="polite">${esc(G.say)}</p></div>`}</section>`;
  }
  function endView() {
    const stars = G.stars;
    const msg = stars === 3 ? 'Tuyệt vời! Các bạn được trọn 3 ngôi sao!' : stars === 2 ? 'Giỏi lắm! Chơi thêm một lượt để lấy đủ 3 sao nhé!' : 'Các bạn đã cố gắng rồi! Mình đọc lại kho báu rồi chơi tiếp nhé!';
    return `<div class="end"><img src="${IMG(stars === 3 ? 'cheer' : stars === 2 ? 'thumbs-up' : 'hiking')}" alt="Trâu Con"><h2>${msg}</h2>
      <div class="stars">${[1, 2, 3].map((k) => I.star(k <= stars)).join('')}</div>
      <p>${G.id === 'lat-the' ? `Các bạn ghép xong ${G.n} cặp sau ${G.moves} lần lật.` : `Đúng ngay lần đầu: ${G.score}/${G.scoreMax || G.n}`}</p>
      <div class="row"><button class="btn primary" data-act="again">Chơi lại</button><a class="btn" href="#tro-choi">Chọn trò khác</a><a class="btn" href="#so-suu-tam">Sổ sưu tầm</a></div></div>`;
  }
  function finish() {
    let ratio;
    if (G.id === 'lat-the') { G.stars = G.moves <= 10 ? 3 : G.moves <= 16 ? 2 : 1; }
    else { G.scoreMax = G.id === 'noi-cau' ? G.rounds.reduce((a, r) => a + r.length, 0) : G.n; ratio = G.score / G.scoreMax; G.stars = ratio >= 0.85 ? 3 : ratio >= 0.55 ? 2 : 1; }
    G.over = true; S.stars += G.stars; S.played += 1; S.best[G.id] = Math.max(S.best[G.id] || 0, G.stars); save();
    sfx.win(); confetti(G.stars * 18);
    render();
  }
  function feedback(ok) {
    G.say = rand(ok ? SAY.ok : SAY.bad); G.mood = ok ? rand(['cheer', 'thumbs-up']) : 'thinking';
    ok ? sfx.ok() : sfx.bad();
  }
  function rerenderStage(shakeSel) {
    app.innerHTML = viewGame(G.id);
    if (shakeSel) { const el = app.querySelector(shakeSel); if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); } }
  }

  /* ── xử lý bấm ── */
  const ACT = {
    en(el) { const t = document.getElementById(el.dataset.target); if (!t) return; t.hidden = !t.hidden; el.setAttribute('aria-expanded', String(!t.hidden)); },
    chip(el) { el.setAttribute('aria-pressed', String(el.getAttribute('aria-pressed') !== 'true')); sfx.flip(); },
    'all-en'(el) { const on = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', String(on)); document.getElementById('chips').classList.toggle('show-en', on); el.textContent = on ? 'Ẩn nghĩa từng tiếng' : 'Hiện nghĩa từng tiếng'; },
    count(el) { const on = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', String(on)); document.getElementById('detail-body').classList.toggle('counting', on); el.innerHTML = on ? 'Ẩn đếm tiếng' : 'Đếm tiếng &amp; tìm vần'; },
    speak(el) { speak(byId[el.dataset.id]); },
    'p-open'(el) { newPractice(el.dataset.id); openPx(); },
    'p-close'() { closePx(); },
    'p-again'() { newPractice(P.id); drawPx(); },
    'p-go'(el) { const t = byId[P.id].type; closePx(); location.hash = el.dataset.id ? 'cau-' + el.dataset.id : t; },
    'p-ans'(el) {
      if (!P || P.solved) return; const v = el.dataset.v, key = P_STEPS[P.step].key;
      const ok = key === 'dien' ? v === P.dien.ans : v === P.id;
      if (!ok) P.wrong.add(v);
      pSolve(ok, `[data-v="${CSS.escape(v)}"]`);
    },
    'p-tile'(el) {
      const x = P.xep, k = +el.dataset.k; if (x.ans.includes(k)) return; x.ans.push(k); sfx.pop();
      if (x.ans.length === x.target.length) {
        const ok = x.ans.every((kk, p) => x.tiles[kk].t === x.target[p]);
        if (!ok) { pSolve(false, '#px-ansrow'); P.say = 'Thứ tự chưa đúng. Các bạn bấm vào tiếng ở hàng trên để gỡ ra rồi xếp lại nhé!'; return drawPx('#px-ansrow'); }
        return pSolve(true);
      }
      drawPx();
    },
    'p-untile'(el) { P.xep.ans.splice(+el.dataset.pos, 1); drawPx(); },
    'p-hint'() {
      const x = P.xep; P.first = false;
      let p = 0; while (p < x.ans.length && x.tiles[x.ans[p]].t === x.target[p]) p++;
      x.ans.splice(p);
      const k = x.tiles.findIndex((t, kk) => t.t === x.target[p] && !x.ans.includes(kk)); if (k >= 0) x.ans.push(k);
      P.say = 'Mình gợi ý một tiếng rồi đó. Các bạn xếp tiếp nhé!'; P.mood = 'thumbs-up';
      if (x.ans.length === x.target.length) return pSolve(true);
      drawPx();
    },
    'p-next'() {
      if (P.step >= 3) return pFinish();
      P.step++; P.solved = false; P.first = true; P.wrong = new Set();
      P.say = rand(['Bài tiếp theo nè!', 'Các bạn đọc thật kỹ nhé!', 'Mình cùng làm bài này nhé!']); P.mood = rand(['reading', 'listening', 'wave']);
      drawPx(); const b = document.querySelector('.px-box'); if (b) b.scrollTop = 0;
    },
    'play-kho'(el, e) { e.preventDefault(); G = null; newGame('dien-tu', el.dataset.kho); location.hash = 'choi-dien-tu'; },
    kho(el) { newGame(G.id, el.dataset.kho); render(); },
    again() { newGame(G.id, G.kho); render(); },
    ans(el) {
      if (G.solved) return; const v = el.dataset.v; const ok = ENG[G.id].answer(G, v);
      if (ok) { G.solved = true; if (G.first) G.score++; feedback(true); rerenderStage(); }
      else { G.first = false; G.wrong.add(v); feedback(false); rerenderStage(`[data-v="${CSS.escape(v)}"]`); }
    },
    next() {
      if (G.id === 'noi-cau') { G.i++; if (G.i >= G.n) return finish(); ENG['noi-cau'].round(G); G.say = 'Lượt mới rồi! Các bạn nối tiếp nhé!'; G.mood = 'reading'; return render(); }
      G.i++; G.solved = false; G.wrong = new Set(); G.first = true;
      if (G.i >= G.n) return finish();
      G.say = rand(['Câu tiếp theo nè!', 'Các bạn đọc thật kỹ nhé!', 'Mình cùng thử câu này nhé!']); G.mood = rand(['reading', 'listening', 'wave']);
      render(); document.getElementById('stage').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    },
    tile(el) {
      const q = G.q[G.i], k = +el.dataset.k; if (q.ans.includes(k)) return; q.ans.push(k); sfx.pop();
      if (q.ans.length === q.target.length) {
        const ok = q.ans.every((kk, p) => q.tiles[kk].t === q.target[p]);
        if (ok) { G.solved = true; if (G.first) G.score++; feedback(true); }
        else { G.first = false; feedback(false); G.say = 'Thứ tự chưa đúng. Các bạn bấm vào tiếng ở hàng trên để gỡ ra và xếp lại nhé!'; }
        return rerenderStage(ok ? null : '#ansrow');
      }
      rerenderStage();
    },
    untile(el) { const q = G.q[G.i]; q.ans.splice(+el.dataset.pos, 1); rerenderStage(); },
    hint() {
      const q = G.q[G.i]; G.first = false;
      let p = 0; while (p < q.ans.length && q.tiles[q.ans[p]].t === q.target[p]) p++;
      q.ans.splice(p);
      const k = q.tiles.findIndex((x, kk) => x.t === q.target[p] && !q.ans.includes(kk)); if (k >= 0) q.ans.push(k);
      G.say = 'Mình gợi ý một tiếng rồi đó. Các bạn xếp tiếp nhé!'; G.mood = 'thumbs-up';
      if (q.ans.length === q.target.length) { G.solved = true; feedback(true); }
      rerenderStage();
    },
    L(el) { G.sel = el.dataset.id; G.bad = null; sfx.flip(); rerenderStage(); },
    R(el) {
      if (!G.sel) { G.say = 'Các bạn bấm một ô bên trái trước nhé!'; G.mood = 'thinking'; return rerenderStage(); }
      const id = el.dataset.id;
      if (id === G.sel) { G.done[id] = Object.keys(G.done).length % 4; if (!G.missed.has(id)) G.score++; G.sel = null; G.bad = null; feedback(true); }
      else { G.missed.add(G.sel); G.bad = id; feedback(false); }
      rerenderStage();
    },
    flip(el) {
      if (G.lock) return; const k = +el.dataset.k; if (el.classList.contains('up') || el.classList.contains('done')) return;
      el.classList.add('up'); sfx.flip(); G.up.push(k);
      if (G.up.length === 2) {
        G.moves++; const [a, b] = G.up, ca = G.cards[a], cb = G.cards[b]; const els = app.querySelectorAll('.mcard');
        document.getElementById('moves').textContent = `Số lần lật: ${G.moves}`;
        if (ca.id === cb.id && ca.k !== cb.k) {
          G.up = []; G.found++; G.score++; els[a].classList.add('done'); els[b].classList.add('done'); feedback(true);
          document.getElementById('gscore').textContent = G.score; document.getElementById('plabel').textContent = `Đã ghép ${G.found}/${G.n} cặp`; document.getElementById('pbar').style.width = Math.round(G.found / G.n * 100) + '%';
          document.getElementById('say').textContent = G.say; document.getElementById('trau-img').src = IMG(G.mood);
          if (G.found === G.n) setTimeout(finish, 700);
        } else {
          G.lock = true; setTimeout(() => { els[a].classList.remove('up'); els[b].classList.remove('up'); G.up = []; G.lock = false; }, 950);
          document.getElementById('say').textContent = 'Chưa khớp rồi. Các bạn nhớ vị trí các thẻ nhé!'; document.getElementById('trau-img').src = IMG('thinking');
        }
      }
    },
    'reset-ask'() { document.getElementById('reset-box').innerHTML = `<span style="font-weight:800">Xóa hết câu đã sưu tầm và ngôi sao trên máy này?</span><button class="btn small" data-act="reset-yes" style="background:var(--bad-bg)">Xóa</button><button class="btn small" data-act="reset-no">Thôi</button>`; },
    'reset-yes'() { S.stickers = {}; S.stars = 0; S.best = {}; S.played = 0; S.practice = {}; save(); render(); toast('Đã xóa tiến độ. Mình bắt đầu lại nhé!'); },
    'reset-no'() { render(); },
    sound() { S.sound = !S.sound; save(); if (S.sound) sfx.pop(); }
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
    const f = ACT[el.dataset.act]; if (f) f(el, e);
  });
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'q') return;
    const q = e.target.value.trim().toLowerCase(); let shown = 0;
    document.querySelectorAll('#cards .card').forEach((c) => { const ok = !q || c.dataset.text.includes(q); c.hidden = !ok; if (ok) shown++; });
    document.getElementById('none').hidden = shown > 0;
  });

  /* ── điều hướng bằng #tên-trang ── */
  function render() {
    const r = decodeURIComponent(location.hash.slice(1));
    let html;
    if (!r || r === 'trang-dau') html = viewHome();
    else if (TK.includes(r)) html = viewLib(r);
    else if (r.startsWith('cau-')) html = viewItem(r.slice(4));
    else if (r === 'tro-choi') html = viewGames();
    else if (r === 'so-suu-tam') html = viewBook();
    else if (r.startsWith('choi-') && gdef(r.slice(5))) html = viewGame(r.slice(5));
    else html = viewHome();
    app.innerHTML = html; setNav(r); updateTop();
    document.title = r.startsWith('cau-') && byId[r.slice(4)] ? `${firstLine(byId[r.slice(4)])} · Kho Báu Lời Ông Bà` : 'Kho Báu Lời Ông Bà';
  }
  let lastRoute = null;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && P) closePx(); });

  /* ── chỉ xem, không sao chép: chặn chuột phải, nhấn giữ, kéo thả ảnh, lưu trang và in ── */
  const editable = (t) => t && t.closest && t.closest('input, textarea, [contenteditable="true"]');
  document.addEventListener('contextmenu', (e) => { if (!editable(e.target)) { e.preventDefault(); if (e.target.closest && e.target.closest('img, svg')) toast('Tranh chỉ để xem trực tuyến, các bạn không lưu về nhé!'); } });
  document.addEventListener('dragstart', (e) => { if (e.target.closest && e.target.closest('img, svg, a')) e.preventDefault(); });
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p')) { e.preventDefault(); toast('Trang này chỉ để xem trực tuyến.'); }
  });
  window.addEventListener('hashchange', () => {
    const r = location.hash.slice(1);
    if (P) closePx();
    if (r.startsWith('choi-') && (!G || G.id !== r.slice(5) || G.over)) { const k = G && G.kho; G = null; newGame(r.slice(5), k); }
    render(); if (r !== lastRoute) window.scrollTo(0, 0); lastRoute = r;
  });
  render(); lastRoute = location.hash.slice(1);
})();
