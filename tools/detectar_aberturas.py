#!/usr/bin/env python3
"""Acha vãos nas paredes da planta e gera folhas de contato ampliadas para conferir portas e janelas.

Uso:  python3 tools/detectar_aberturas.py planta.webp paredes.json pasta_saida

Regra inicial (só um palpite, confira sempre nas folhas):
  linha fina de vidro ao longo do vão  -> janela
  vão sem linha (com arco de porta)     -> porta
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont

def abrir(caminho):
    src = Image.open(caminho).convert('RGBA'); f = Image.new('RGBA', src.size, (255, 255, 255, 255)); f.alpha_composite(src); return f.convert('RGB')

def candidatos(im, rects):
    a = np.asarray(im).astype(int); g = a.mean(axis=2); sat = a.max(axis=2) - a.min(axis=2)
    wm = np.zeros(g.shape, bool)
    for r in rects: wm[r[1]:r[3], r[0]:r[2]] = True
    wd = np.asarray(Image.fromarray((wm * 255).astype('uint8')).filter(ImageFilter.MaxFilter(7))) > 127
    thin = (g < 130) & (sat < 40) & ~wd
    def bandas(h):
        c = [r for r in rects if (h and (r[2]-r[0]) >= 24 and 8 <= (r[3]-r[1]) <= 18) or (not h and (r[3]-r[1]) >= 24 and 8 <= (r[2]-r[0]) <= 18)]
        out = []
        for r in sorted(c, key=lambda r: (r[1] if h else r[0])):
            k = (r[1], r[3]) if h else (r[0], r[2])
            if not any(abs(b[0]-k[0]) <= 4 and abs(b[1]-k[1]) <= 4 for b in out): out.append(k)
        return out
    res = []
    for h in (True, False):
        for b0, b1 in bandas(h):
            occ = []
            for r in rects:
                if h:
                    ok = ((r[2]-r[0]) >= 24 and 8 <= (r[3]-r[1]) <= 18 and abs(r[1]-b0) <= 4 and abs(r[3]-b1) <= 4) or ((r[3]-r[1]) > (r[2]-r[0]) and (b0-4 <= r[3] <= b1+4 or b0-4 <= r[1] <= b1+4))
                    if ok: occ.append((r[0], r[2]))
                else:
                    ok = ((r[3]-r[1]) >= 24 and 8 <= (r[2]-r[0]) <= 18 and abs(r[0]-b0) <= 4 and abs(r[2]-b1) <= 4) or ((r[2]-r[0]) > (r[3]-r[1]) and (b0-4 <= r[2] <= b1+4 or b0-4 <= r[0] <= b1+4))
                    if ok: occ.append((r[1], r[3]))
            occ.sort(); m = []
            for s, e in occ:
                if m and s <= m[-1][1] + 2: m[-1][1] = max(m[-1][1], e)
                else: m.append([s, e])
            for i in range(len(m) - 1):
                s, e = m[i][1], m[i+1][0]
                if not (14 <= e - s <= 230): continue
                c = (b0 + b1) // 2
                seg = thin[c-4:c+5, s:e].any(axis=0) if h else thin[s:e, c-4:c+5].any(axis=1)
                box = [s, b0, e, b1] if h else [b0, s, b1, e]
                res.append(dict(box=box, cov=round(float(seg.mean()), 2), t='j' if seg.mean() >= .5 else 'p'))
    return res

def folhas(im, cands, saida, por_folha=12):
    os.makedirs(saida, exist_ok=True)
    for n in range(0, len(cands), por_folha):
        lote = cands[n:n+por_folha]; cel = 330
        folha = Image.new('RGB', (cel*4, cel*3), 'white'); d = ImageDraw.Draw(folha)
        for i, c in enumerate(lote):
            x0, y0, x1, y1 = c['box']; cx, cy = (x0+x1)//2, (y0+y1)//2
            crop = im.crop((cx-55, cy-55, cx+55, cy+55)).resize((cel-6, cel-6), Image.LANCZOS)
            dd = ImageDraw.Draw(crop); k = (cel-6)/110
            dd.rectangle([(x0-(cx-55))*k, (y0-(cy-55))*k, (x1-(cx-55))*k, (y1-(cy-55))*k], outline=(255, 0, 255), width=3)
            folha.paste(crop, ((i % 4)*cel+3, (i//4)*cel+3))
            d.text(((i % 4)*cel+10, (i//4)*cel+8), f'#{n+i} {c["t"]} cov={c["cov"]}', fill=(0, 0, 255))
        folha.save(os.path.join(saida, f'folha{n//por_folha}.png'))

if __name__ == '__main__':
    if len(sys.argv) != 4: sys.exit(__doc__)
    im = abrir(sys.argv[1]); rects = json.load(open(sys.argv[2])); cs = candidatos(im, rects)
    os.makedirs(sys.argv[3], exist_ok=True)
    json.dump(cs, open(os.path.join(sys.argv[3], 'candidatos.json'), 'w'))
    folhas(im, cs, sys.argv[3]); print(len(cs), 'candidatos')
