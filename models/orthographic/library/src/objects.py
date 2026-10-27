# -*- coding: utf-8 -*-
"""三視圖物件庫：每個物件用「凸基本體＋聯集／差集」定義。

座標（單位 mm）：X＝寬（正視圖由左到右）、Y＝深（y=0 是正面，往後增加）、Z＝高（向上）。
正視圖從 -Y 往 +Y 看；俯視圖從 +Z 往下看；右側視圖從 +X 往 -X 看（第三角法）。

同一份定義同時產生：
  1. OpenSCAD 程式（→ STL 網格，給投影器與 3D 檢視器）
  2. 解析式的射線區間（verify_views.py 獨立驗算用，不經過網格）
基本體都是凸的：box、cyl（軸平行座標軸的圓柱）、prism（凸多邊形沿座標軸擠出）。
"""

AX = {'x': 0, 'y': 1, 'z': 2}


def others(axis):
    """擠出軸以外的兩個座標軸（依 x<y<z 排序）。"""
    return [a for a in 'xyz' if a != axis]


class Box:
    kind = 'box'

    def __init__(self, x0, x1, y0, y1, z0, z1):
        self.lo = (x0, y0, z0)
        self.hi = (x1, y1, z1)


class Cyl:
    """圓柱：axis 為軸向；c 為另兩軸（依 x<y<z 排序）上的圓心；軸向範圍 a0..a1。"""
    kind = 'cyl'

    def __init__(self, axis, c, r, a0, a1):
        self.axis, self.c, self.r, self.a0, self.a1 = axis, tuple(c), r, a0, a1


class Prism:
    """凸多邊形 poly（座標在另兩軸，依 x<y<z 排序）沿 axis 從 a0 擠出到 a1。"""
    kind = 'prism'

    def __init__(self, axis, poly, a0, a1):
        self.axis, self.poly, self.a0, self.a1 = axis, [tuple(p) for p in poly], a0, a1


class Solid:
    """加的基本體（聯集）減掉 cuts 中的基本體（差集）。"""

    def __init__(self, add, cut=(), extra_center=None):
        self.add = list(add)
        self.cut = list(cut)
        # 需要額外畫的中心線（畫面座標，依視圖），例如長圓孔沿長度方向的中心線
        self.extra_center = extra_center or {}


FN = 64  # 圓的分段數（4 的倍數 → 圓的上下左右極點剛好是頂點，輪廓線位置精確）


def _fmt(v):
    return ('%.4f' % v).rstrip('0').rstrip('.')


def prim_scad(p):
    if p.kind == 'box':
        (x0, y0, z0), (x1, y1, z1) = p.lo, p.hi
        return 'translate([%s,%s,%s]) cube([%s,%s,%s]);' % tuple(map(_fmt, (x0, y0, z0, x1 - x0, y1 - y0, z1 - z0)))
    h = p.a1 - p.a0
    if p.kind == 'cyl':
        body = 'translate([%s,%s,0]) cylinder(h=%s, r=%s, $fn=%d);' % (_fmt(p.c[0]), _fmt(p.c[1]), _fmt(h), _fmt(p.r), FN)
    else:
        pts = ','.join('[%s,%s]' % (_fmt(a), _fmt(b)) for a, b in p.poly)
        body = 'linear_extrude(height=%s) polygon([%s]);' % (_fmt(h), pts)
    a0, a1 = _fmt(p.a0), _fmt(p.a1)
    if p.axis == 'z':
        m = '[[1,0,0,0],[0,1,0,0],[0,0,1,%s],[0,0,0,1]]' % a0
    elif p.axis == 'x':   # 局部 (X,Y,Z) → 世界 (y,z,x)
        m = '[[0,0,1,%s],[1,0,0,0],[0,1,0,0],[0,0,0,1]]' % a0
    else:                  # 'y'：局部 (X,Y,Z) → 世界 (x, a1-Z, y)；行列式 +1，不翻面
        m = '[[1,0,0,0],[0,0,-1,%s],[0,1,0,0],[0,0,0,1]]' % a1
    return 'multmatrix(%s) %s' % (m, body)


def solid_scad(s):
    add = '\n    '.join(prim_scad(p) for p in s.add)
    if not s.cut:
        return 'union() {\n    %s\n}\n' % add
    cut = '\n    '.join(prim_scad(p) for p in s.cut)
    return 'difference() {\n  union() {\n    %s\n  }\n  union() {\n    %s\n  }\n}\n' % (add, cut)


# ------------------------------------------------------------------
# 物件庫（難度 1～4）
# 每個物件：id、名稱、難度、尺寸說明、文字描述（給「依文字說明產生圖片」用）、Solid
# ------------------------------------------------------------------
E = 1.0  # 貫穿用的切削體多伸出 1 mm（避免共面）

LIB = []


def obj(id, name, level, desc, solid, note=''):
    LIB.append(dict(id=id, name=name, level=level, desc=desc, solid=solid, note=note))


obj('block', '長方塊', 1, '長 60、深 40、高 30 的長方體。',
    Solid([Box(0, 60, 0, 40, 0, 30)]))

obj('lblock', 'L 形塊', 1,
    '底座 60×40×15；左邊立起一塊寬 20、全深、高 45 的立板，正視看是 L 形。',
    Solid([Box(0, 60, 0, 40, 0, 15), Box(0, 20, 0, 40, 0, 45)]))

obj('step3', '三階梯塊', 1,
    '寬 60、深 40；由左到右三階，高度 45、30、15，每階寬 20。',
    Solid([Box(0, 20, 0, 40, 0, 45), Box(20, 40, 0, 40, 0, 30), Box(40, 60, 0, 40, 0, 15)]))

obj('tee', '倒 T 形塊', 1,
    '底座 60×40×15；中間立起寬 20（x 20～40）、全深、高 45 的立板。',
    Solid([Box(0, 60, 0, 40, 0, 15), Box(20, 40, 0, 40, 0, 45)]))

obj('notch', '凹槽塊', 2,
    '長方塊 60×40×30，頂面中央由前到後挖一道寬 20、深 15 的方槽（貫穿前後）。',
    Solid([Box(0, 60, 0, 40, 0, 30)], [Box(20, 40, -E, 40 + E, 15, 30 + E)]))

obj('chamfer', '前斜切塊', 2,
    '長方塊 60×40×40，前上方被一個斜面切掉：斜面從正面高 20 處，斜上到頂面離正面 15 處。',
    Solid([Prism('x', [(0, 0), (40, 0), (40, 40), (15, 40), (0, 20)], 0, 60)]))

obj('ramp', '斜坡塊', 2,
    '深 40；正視輪廓左邊高 40、平頂寬 20，再從 x=20 斜下到右端高 15。',
    Solid([Prism('y', [(0, 0), (60, 0), (60, 15), (20, 40), (0, 40)], 0, 40)]))

obj('holeplate', '圓孔板', 2,
    '平板 60×40×15，正中央有一個直徑 16 的垂直貫穿孔。',
    Solid([Box(0, 60, 0, 40, 0, 15)], [Cyl('z', (30, 20), 8, -E, 15 + E)]))

obj('vblock', 'V 形槽塊', 3,
    '長方塊 60×40×35，頂面中央由前到後有一道 V 形槽：槽口寬 30、槽深 15。',
    Solid([Box(0, 60, 0, 40, 0, 35)], [Prism('y', [(15, 35), (30, 20), (45, 35), (45, 36), (15, 36)], -E, 40 + E)]))

obj('tslot', 'T 形槽塊', 3,
    '長方塊 60×40×40，由前到後貫穿一道 T 形槽：槽口寬 10、深 12；下方寬槽寬 30、高 12。',
    Solid([Box(0, 60, 0, 40, 0, 40)], [Box(25, 35, -E, 40 + E, 28, 40 + E), Box(15, 45, -E, 40 + E, 16, 28)]))

obj('dovetail', '鳩尾槽塊', 3,
    '長方塊 60×40×30，頂面由前到後貫穿一道鳩尾槽：槽口寬 20、槽底寬 36、深 12。',
    Solid([Box(0, 60, 0, 40, 0, 30)], [Prism('y', [(12, 18), (48, 18), (40, 30), (20, 30)], -E, 40 + E),
                                        Box(20, 40, -E, 40 + E, 29, 31)]))

obj('cbore', '沉頭孔塊', 3,
    '長方塊 60×40×25，中央有直徑 12 的貫穿孔，孔口有直徑 24、深 8 的沉頭。',
    Solid([Box(0, 60, 0, 40, 0, 25)], [Cyl('z', (30, 20), 6, -E, 25 + E), Cyl('z', (30, 20), 12, 17, 25 + E)]))

obj('cylstack', '雙層圓柱', 3,
    '下層圓柱直徑 56、高 15；上層同軸圓柱直徑 32、高 25；中心有直徑 14 的貫穿孔。',
    Solid([Cyl('z', (28, 28), 28, 0, 15), Cyl('z', (28, 28), 16, 15, 40)], [Cyl('z', (28, 28), 7, -E, 40 + E)]))

obj('bracket', '角架', 4,
    '底板 60×40×10；後方立板 60×10×45；立板中央有直徑 14 的前後貫穿孔（中心高 30），底板左右各有一個直徑 10 的垂直孔。',
    Solid([Box(0, 60, 0, 40, 0, 10), Box(0, 60, 30, 40, 0, 45)],
          [Cyl('y', (30, 30), 7, 30 - E, 40 + E), Cyl('z', (15, 15), 5, -E, 10 + E), Cyl('z', (45, 15), 5, -E, 10 + E)]))

obj('lhole', 'L 形孔塊', 4,
    '底座 60×40×15；左邊立板寬 20、高 45；底座右邊有直徑 12 的垂直貫穿孔（圓心 x=42、y=20）；立板有直徑 12 的左右貫穿孔（中心高 32）。',
    Solid([Box(0, 60, 0, 40, 0, 15), Box(0, 20, 0, 40, 0, 45)],
          [Cyl('z', (42, 20), 6, -E, 15 + E), Cyl('x', (20, 32), 6, -E, 20 + E)]))

obj('slotplate', '長孔板', 4,
    '平板 70×40×12，中央有一個長 40、寬 16 的長圓孔（兩端半圓）垂直貫穿。',
    Solid([Box(0, 70, 0, 40, 0, 12)], [Box(23, 47, 12, 28, -E, 12 + E), Cyl('z', (23, 20), 8, -E, 12 + E), Cyl('z', (47, 20), 8, -E, 12 + E)],
          extra_center={'top': [(12, 20, 58, 20)], 'bottom': [(12, -20, 58, -20)]}))

obj('boss', '凸台座', 4,
    '底板 70×44×12；正中央凸起直徑 26、高 20 的圓凸台；直徑 12 的孔從凸台頂面貫穿到底；底板四角各一個直徑 8 的孔。',
    Solid([Box(0, 70, 0, 44, 0, 12), Cyl('z', (35, 22), 13, 12, 32)],
          [Cyl('z', (35, 22), 6, -E, 32 + E)] + [Cyl('z', (x, y), 4, -E, 12 + E) for x in (10, 60) for y in (10, 34)]))

obj('rib', '肋板角架', 4,
    '底板 60×40×10；左邊立板寬 10、全深、高 45；中間有一片厚 10 的三角肋板連接立板與底板（深 20 處到底板右端）。',
    Solid([Box(0, 60, 0, 40, 0, 10), Box(0, 10, 0, 40, 0, 45), Prism('y', [(10, 10), (50, 10), (10, 45)], 15, 25)]))

BY_ID = {o['id']: o for o in LIB}
