#!/usr/bin/env python3
"""Extrai as paredes de uma planta baixa (imagem) para o painel 3D.

Uso:  python3 tools/extrair_planta.py docs/plantas/planta-atual.webp saida_paredes.json

Funciona com plantas em que as paredes são traço preto com miolo cinza (como a enviada).
O resultado é uma lista de retângulos [x0, y0, x1, y1] em pixels da imagem, que vai para js/plan-data.js (WALLS).
Escala usada pelo painel: 46,5 px = 1 m (conferida pelas cotas da planta de 12,06 m x 16,94 m).
Requer: pip install pillow numpy
"""
import json, sys
import numpy as np
from PIL import Image, ImageFilter

def abrir(caminho):
    src = Image.open(caminho).convert('RGBA')
    fundo = Image.new('RGBA', src.size, (255, 255, 255, 255)); fundo.alpha_composite(src)
    return fundo.convert('RGB')

def abertura(m, k):
    img = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MinFilter(k)).filter(ImageFilter.MaxFilter(k))
    return np.asarray(img) > 127

def retangulos(mask, celula=2):
    h, w = mask.shape
    g = np.zeros((h // celula, w // celula), bool)
    for y in range(g.shape[0]):
        for x in range(g.shape[1]):
            g[y, x] = mask[y*celula:(y+1)*celula, x*celula:(x+1)*celula].mean() > 0.5
    usado = np.zeros_like(g); out = []
    for y in range(g.shape[0]):
        x = 0
        while x < g.shape[1]:
            if g[y, x] and not usado[y, x]:
                x1 = x
                while x1 + 1 < g.shape[1] and g[y, x1 + 1] and not usado[y, x1 + 1]: x1 += 1
                y1 = y
                while y1 + 1 < g.shape[0] and all(g[y1 + 1, x:x1 + 1]) and not any(usado[y1 + 1, x:x1 + 1]): y1 += 1
                usado[y:y1 + 1, x:x1 + 1] = True
                out.append([x * celula, y * celula, (x1 + 1) * celula, (y1 + 1) * celula]); x = x1 + 1
            else: x += 1
    return [r for r in out if (r[2] - r[0]) * (r[3] - r[1]) >= 40]

def main(entrada, saida, topo=800, base=1870):
    a = np.asarray(abrir(entrada)).astype(int)
    cinza = a.mean(axis=2); sat = a.max(axis=2) - a.min(axis=2)
    m = (sat < 35) & (cinza < 170)          # preto e cinza escuro, sem cor (exclui cotas vermelhas e jardim verde)
    m[:topo, :] = False; m[base:, :] = False  # ignora título, jardim e marcos do portão
    paredes = abertura(m, 9)                 # abertura morfológica: some o que for mais fino que uma parede
    img = Image.fromarray((paredes * 255).astype('uint8')).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    rs = retangulos(np.asarray(img) > 127)
    json.dump(rs, open(saida, 'w'))
    print(len(rs), 'retângulos de parede ->', saida)

if __name__ == '__main__':
    if len(sys.argv) != 3: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
