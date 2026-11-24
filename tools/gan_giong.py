#!/usr/bin/env python3
"""Ghi danh sách câu đã có tệp audio/<mã>.mp3 vào dòng `return { TYPES, items, AUDIO: {...} };` của data.js.
Robot giọng đọc AI (tools/giong_ai.py) chạy tệp này sau mỗi lô."""
import pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
co = sorted(f.stem for f in (ROOT / 'audio').glob('*.mp3'))
p = ROOT / 'data.js'
s = p.read_text(encoding='utf-8')
moi = 'AUDIO: {' + ', '.join(f'{m}: true' for m in co) + '}'
s2, n = re.subn(r'AUDIO: \{[^}]*\}', moi, s, count=1)
if n != 1: raise SystemExit('Không tìm thấy dòng AUDIO trong data.js')
if s2 != s: p.write_text(s2, encoding='utf-8')
print('data.js AUDIO:', len(co), 'câu')
