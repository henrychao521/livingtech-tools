"""美工刀（18 mm 折刃式，大型）。
刀片：寬 18 mm、全長 110 mm、刃長 100 mm、8 節、厚 0.5 mm（OLFA LB 系列刀片規格）。
刀身：長 160 mm（OLFA NOL-1 商品尺寸 16 × 3.8 × 2.7 cm）；刀身高 26 mm、厚 17 mm 為常見值（估計）。
折線與刃口夾角約 60°（依刀片外形估計，未取得官方數值）。
擺法：長軸沿 X、刀片朝 +X、刀片平面朝 -Y。刀片推出 2 節。
"""
import math
from common import *

m = Model("knife", tol=0.03)
BL, BW, BT, NSEG = 110.0, 18.0, 0.5, 8
PITCH = 100.0 / NSEG          # 沿刃口每節 12.5 mm
ANG = 60.0                    # 折線角度
dx = BW / math.tan(math.radians(ANG))   # 折線在刀寬方向的水平偏移

L, HB, TB = 160.0, 26.0, 17.0
EXT = 2 * PITCH + 4           # 推出長度（2 節＋刀尖）

# 刀身（黃色塑膠）：前端收成刀鼻
body = slab([(0, 0), (L - 22, 0), (L - 4, 6), (L, 10), (L, 19), (L - 10, HB), (12, HB), (0, HB - 6)], TB, plane=Plane.XZ)
body = safe_fillet(body, body.edges().filter_by(Axis.Y), 2.0)
# 頂部滑軌槽（放金屬導軌與滑鈕）
body -= Pos(L / 2 - 10, 0, HB) * Box(L - 40, 7, 6)
# 刀片出口
body -= Pos(L, 0, 4 + BW / 2) * Box(30, 1.6, BW + 1)

# 金屬導軌（不鏽鋼，沿頂部）
rail = Pos(L / 2 - 10, 0, HB - 1.8) * Box(L - 40, 7.6, 1.2)
rail_side = Pos(L / 2 - 6, -TB / 2 - 0.3, HB - 5) * Box(L - 30, 0.6, 7)
rail_side2 = Pos(L / 2 - 6, TB / 2 + 0.3, HB - 5) * Box(L - 30, 0.6, 7)
nose = Pos(L - 9, 0, 13) * Box(18, TB + 0.8, 24)
nose = nose & slab([(L - 22, -1), (L - 4, 5.5), (L + 0.4, 9.6), (L + 0.4, 19.4), (L - 10, HB + 1), (L - 22, HB + 1)], TB + 1, plane=Plane.XZ)
nose -= Pos(L, 0, 4 + BW / 2) * Box(30, 1.6, BW + 1)

# 滑鈕（推刀）：位於導軌上，對應刀片推出位置
xs = L - 60
slider = Pos(xs, 0, HB + 1.5) * Box(22, 9, 5)
slider = safe_fillet(slider, slider.edges().group_by(Axis.Z)[-1], 1.5)
for i in range(5):
    slider -= Pos(xs - 7 + i * 3.5, 0, HB + 4.1) * Box(1.2, 10, 1.4)
# 尾蓋＋折刃器缺口
cap = Pos(4, 0, HB / 2) * Box(8, TB + 0.6, HB + 0.2)
cap = safe_fillet(cap, cap.edges().filter_by(Axis.Y), 2.0)
cap -= Pos(4, 0, HB - 4) * Box(10, 1.2, 9)

# 刀片：平行四邊形，刃口在下（z=4），刀背在上
z0 = 4.0
x_tip = L + EXT
x_back = x_tip - BL
pts = [(x_back, z0), (x_tip, z0), (x_tip - dx, z0 + BW), (x_back - dx, z0 + BW)]
blade = slab(pts, BT, plane=Plane.XZ)
# 刃口斜磨面（底部 1.6 mm 收薄成刀刃）
blade -= extrude(Plane.XZ * make_face(Polyline((x_back - 30, z0 - 1), (x_tip + 5, z0 - 1), (x_tip + 5, z0 + 1.6), (x_back - 30, z0 + 1.6), close=True)), amount=BT, both=True) \
    - extrude(Plane.YZ * make_face(Polyline((-BT / 2, z0 + 1.6), (BT / 2, z0 + 1.6), (0.04, z0), (-0.04, z0), close=True)), amount=400, both=True)
# 折線（深色細線，兩面）
lines = None
for k in range(1, NSEG):
    xa = x_tip - k * PITCH
    seg = slab([(xa, z0 + 0.6), (xa + 0.35, z0 + 0.6), (xa + 0.35 - dx * (BW - 1.2) / BW, z0 + BW - 0.6), (xa - dx * (BW - 1.2) / BW, z0 + BW - 0.6)], BT + 0.08, plane=Plane.XZ)
    lines = seg if lines is None else lines + seg

m.add(body, "yellow_plastic", "body")
m.add(cap, "black_plastic", "cap")
m.add(slider, "black_plastic", "slider")
m.add(rail + rail_side + rail_side2 + nose, "steel", "rail")
m.add(blade, "blade", "blade")
m.add(lines, "dark_steel", "score")

m.dim("blade_width", BW, "OLFA LB 刀片：寬 18 mm")
m.dim("blade_length", BL, "OLFA LB 刀片：全長 110 mm、刃長 100 mm、8 節")
m.dim("blade_thickness", BT, "OLFA LB-10B 經銷商規格：厚 0.5 mm")
m.dim("body_length", L, "OLFA NOL-1 商品尺寸：長 16 cm")
m.dim("segment_pitch_along_edge", PITCH, "100 mm 刃長 ÷ 8 節")
m.dim("snap_line_angle_deg", ANG, "依刀片外形估計（未取得官方數值）")
m.export()
