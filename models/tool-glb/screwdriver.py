"""十字起子 PH2 × 100。
尺寸：刀桿長 100 mm、全長 205 mm（RS Components：Phoenix Contact PH2、100 mm blade、205 mm overall，ISO 8764-1）；
刀桿直徑 6 mm、握把最大直徑 32 mm 為 PH2 常見值（估計）。刀頭為 PH 四翼十字（ISO 8764-1 形式，翼角為示意）。
擺法：長軸沿 X、刀頭朝 +X。
"""
import math
from common import *

m = Model("screwdriver", tol=0.03)
BLADE, ALL, D_SH, D_H = 100.0, 205.0, 6.0, 32.0
HANDLE = ALL - BLADE   # 105

# 握把：旋轉體輪廓（x 沿軸、r 半徑），尾端圓弧
prof = [(0, 0), (0, 11), (2, 14.5), (8, 16), (60, 15.2), (85, 13.0), (97, 10.5), (HANDLE, 7.0), (HANDLE, 0)]
handle = revolve(Plane.XY * make_face(Polyline(*prof, close=True)), axis=Axis.X)
# 握把防滑溝（6 道縱溝，在握持段）
for i in range(6):
    a = i * 60
    g = Pos(42, 0, 0) * Rot(a, 0, 0) * Pos(0, 0, 16.2) * Box(64, 4.5, 3.2)
    handle -= g
handle = Rot(0, 0, 0) * handle
# 握把前端黑色護套
ferrule = Pos(HANDLE - 6, 0, 0) * (Rot(0, 90, 0) * Cylinder(10.6, 12))

# 刀桿
shank_len = BLADE - 9.0
shank = Pos(HANDLE + shank_len / 2, 0, 0) * (Rot(0, 90, 0) * Cylinder(D_SH / 2, shank_len))
shank += Pos(HANDLE - 15, 0, 0) * (Rot(0, 90, 0) * Cylinder(D_SH / 2, 30))  # 插入握把的部分
# PH 刀頭：錐形收尖（長 9 mm），切四道 V 槽形成十字翼
x0 = HANDLE + shank_len
tip = Pos(x0, 0, 0) * (Rot(0, 90, 0) * Cone(D_SH / 2, 0.45, 9.0, align=(Align.CENTER, Align.CENTER, Align.MIN)))
for i in range(4):
    a = 45 + i * 90
    # V 槽：以三角柱沿軸向切，越靠尖端越深
    v = extrude(Plane.YZ * make_face(Polyline((0, 0.35), (-1.6, 3.6), (1.6, 3.6), close=True)), amount=9.5)
    v = Pos(x0, 0, 0) * Rot(a, 0, 0) * v
    tip -= v
m.add(handle, "red_handle", "handle")
m.add(ferrule, "black_plastic", "ferrule")
m.add(shank + tip, "chrome", "shank")

bb = Compound([handle, shank, tip]).bounding_box()
m.dim("overall_length", bb.size.X, "RS 0170599：全長 205 mm")
m.dim("blade_length", ALL - HANDLE, "RS 0170599：刀桿 100 mm（PH2）")
m.dim("shank_diameter", D_SH, "PH2 常見值 6 mm（估計）")
m.dim("handle_diameter", 2 * 16, "常見值（估計）")
m.export()
