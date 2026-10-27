# -*- coding: utf-8 -*-
"""建置物件庫：.scad → STL（OpenSCAD）→ 六視圖＋等角圖線條 → library.json／library-data.js／SVG。

用法：python3 build.py [--only id1,id2] [--skip-scad]
輸出到 out/：<id>.scad、<id>.stl（二進位）、library.json、library-data.js、svg/<id>-three.svg、svg/<id>-six.svg
"""
import json, os, subprocess, sys, time
import numpy as np
import objects as O
import os as _os
# 輸出位置：放在網站 repo 的 models/orthographic/library/src/ 時，輸出到上一層（library/）；在工作資料夾時輸出到 out/
_HERE = _os.path.dirname(_os.path.abspath(__file__))
OUTDIR = _os.environ.get('ORTHO_OUT') or (_os.path.dirname(_HERE) if _os.path.basename(_HERE) == 'src' else _os.path.join(_HERE, 'out'))
import project as P

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = OUTDIR
OPENSCAD = '/Applications/OpenSCAD-2021.01.app/Contents/MacOS/OpenSCAD'
VIEW_ORDER = ['front', 'top', 'right', 'left', 'bottom', 'rear', 'iso']


def q(v):  # 0.1 mm 整數
    return int(round(v * 10))


def build_one(o, skip_scad=False):
    sid = o['id']
    scad = os.path.join(OUT, sid + '.scad')
    stl_ascii = os.path.join(OUT, sid + '.ascii.stl')
    stl = os.path.join(OUT, sid + '.stl')
    head = '// %s（%s）— 由 ortho_lib_work/objects.py 產生，請改 objects.py 後重建\n// %s\n' % (o['name'], sid, o['desc'])
    open(scad, 'w').write(head + O.solid_scad(o['solid']))
    if not skip_scad or not os.path.exists(stl):
        t0 = time.time()
        subprocess.run([OPENSCAD, '-o', stl_ascii, scad], check=True, capture_output=True)
        verts, faces = P.load_stl(stl_ascii)
        P.write_binary_stl(stl, verts, faces)
        os.remove(stl_ascii)
        print('  %s：OpenSCAD %.1fs，%d 三角形' % (sid, time.time() - t0, len(faces)))
    verts, faces = P.load_stl(stl)
    mesh = P.Mesh(verts, faces)
    lo, hi = verts.min(0), verts.max(0)
    rec = dict(id=sid, name=o['name'], level=o['level'], desc=o['desc'],
               size=[round(float(x), 2) for x in (hi - lo)], views={})
    for vk in VIEW_ORDER:
        V = P.VIEWS[vk]
        r, w = np.array(V['r']), np.array(V['w'])
        lines = P.project(mesh, vk, with_hidden=(vk != 'iso'))
        corners = np.array([[x, y, z] for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])])
        U, W = corners @ r, corners @ w
        if vk == 'iso':
            # 等角圖的外框取實際線條範圍
            pts = np.array([s[:2] for s in lines['vis']] + [s[2:] for s in lines['vis']])
            U, W = pts[:, 0], pts[:, 1]
        ctr = P.center_lines(o['solid'], vk, (lo, hi)) if vk != 'iso' else []
        rec['views'][vk] = dict(
            box=[q(U.min()), q(W.min()), q(U.max()), q(W.max())],
            vis=[[c for p in pl for c in (q(p[0]), q(p[1]))] for pl in P.chain(lines['vis'])],
            hid=[[c for p in pl for c in (q(p[0]), q(p[1]))] for pl in P.chain(lines['hid'])],
            ctr=[[q(s[0]), q(s[1]), q(s[2]), q(s[3])] for s in ctr],
        )
    return rec


def main():
    os.makedirs(OUT, exist_ok=True)
    only = None
    if '--only' in sys.argv:
        only = set(sys.argv[sys.argv.index('--only') + 1].split(','))
    skip = '--skip-scad' in sys.argv
    lib_path = os.path.join(OUT, 'library.json')
    lib = json.load(open(lib_path)) if (only and os.path.exists(lib_path)) else {'objects': {}}
    for o in O.LIB:
        if only and o['id'] not in only:
            continue
        lib['objects'][o['id']] = build_one(o, skip)
    lib['order'] = [o['id'] for o in O.LIB]
    lib['units'] = '0.1 mm 整數；畫面座標 u 向右、v 向上'
    lib['convention'] = '第三角法；y=0 為正面；正視從 -Y 看、俯視從 +Z 看、右側視從 +X 看'
    json.dump(lib, open(lib_path, 'w'), ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(OUT, 'library-data.js'), 'w') as f:
        f.write('/* 三視圖物件庫（由 ortho_lib_work/build.py 自動產生，勿手改）。\n'
                ' * 線條由 OpenSCAD 網格正投影算出：vis 可見線、hid 隱藏線、ctr 中心線；單位 0.1 mm。 */\n')
        f.write('window.ORTHO_LIB = ')
        json.dump(lib, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')
    print('library.json：%d 個物件，%.0f KB' % (len(lib['objects']), os.path.getsize(lib_path) / 1024))


if __name__ == '__main__':
    main()
