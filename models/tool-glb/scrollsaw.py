"""16 吋線鋸機（平行臂、可變速）。
尺寸：整機 26-3/8 × 13 × 14-3/4 in（670 × 330 × 375 mm）、喉深 16 in（406 mm）、鋸條 5 in（127 mm，有銷／無銷）、
行程 9/16 in（14.3 mm）、工作台左傾 0–45°（WEN 3921 說明書 Technical Data）；工作台 16 × 10 in（406 × 254 mm，WEN 3920 規格）。
臂斷面、馬達尺寸為估計值。擺法：長軸沿 X、操作者在 +X 端（鋸條側），正面（-Y）看到 C 形側面。
"""
from common import *

m = Model("scrollsaw", tol=0.1)
IN = 25.4
L, Wd, H_ALL = 26.375 * IN, 13 * IN, 14.75 * IN      # 670 × 330 × 375
H = H_ALL - 12.0                   # 扣掉腳墊高度
THROAT, BLADE = 16 * IN, 5 * IN
XB = 250.0                         # 鋸條位置
X0 = XB - (L - 100)                 # 機身後端（讓總長 = L）
TBL_L, TBL_W, ZT = 16 * IN, 10 * IN, 215.0

# 底座（前窄後寬的鑄件）
base = slab([(X0, -150), (X0 + 330, -150), (XB + 60, -110), (XB + 60, 110), (X0 + 330, 150), (X0, 150)], 70, plane=Plane.XY, both=False)
base = safe_fillet(base, base.edges().filter_by(Axis.Z), 12)
feet = [Pos(x, y, -6) * Cylinder(14, 12) for x in (X0 + 30, XB + 30) for y in (-120, 120) if not (x > 0 and abs(y) > 100)] + \
       [Pos(XB + 30, y, -6) * Cylinder(14, 12) for y in (-90, 90)]
# 後立柱＋馬達罩
col_front = XB - THROAT
column = Pos((X0 + col_front) / 2, 0, 60) * Box(col_front - X0, 110, 270, align=(Align.CENTER, Align.CENTER, Align.MIN))
column = safe_fillet(column, column.edges().filter_by(Axis.Z), 20)
motor = Pos(X0 + 90, 0, 120) * (Rot(90, 0, 0) * Cylinder(55, 230)) + Pos(X0 + 90, 0, 120) * (Rot(90, 0, 0) * Cylinder(40, Wd))
# 下臂罩（工作台下方，從立柱延伸到前端）
lower = Pos((col_front + XB + 30) / 2, 0, 60) * Box(XB + 30 - col_front + 20, 90, ZT - 75, align=(Align.CENTER, Align.CENTER, Align.MIN))
lower = safe_fillet(lower, lower.edges().filter_by(Axis.Y), 15)
# 工作台＋耳軸
table = Pos(XB + 100 - TBL_L / 2, 0, ZT - 14) * Box(TBL_L, TBL_W, 14, align=(Align.CENTER, Align.CENTER, Align.MIN))
table -= Pos(XB, 0, ZT) * Cylinder(14, 40)         # 鋸條孔
table -= Pos(XB + 60, 0, ZT) * Box(120, 2.2, 40)    # 換鋸條槽
insert = Pos(XB, 0, ZT - 3) * Cylinder(14, 3, align=(Align.CENTER, Align.CENTER, Align.MIN)) - Pos(XB, 0, ZT) * Cylinder(3, 10)
trunnion = extrude(Plane.YZ * make_face(Polyline((-80, ZT - 14), (80, ZT - 14), (0, ZT - 80), close=True)), amount=12, both=True)
trunnion = Pos(XB - 40, 0, 0) * trunnion
tilt_knob = Pos(XB - 40, -95, ZT - 50) * (Rot(90, 0, 0) * Cylinder(14, 18))
# 上臂（平行臂上支）
ARM_Z = 296.0
upper = Pos((col_front - 30 + XB + 35) / 2, 0, ARM_Z) * Box(XB + 35 - col_front + 30, 44, 46, align=(Align.CENTER, Align.CENTER, Align.MIN))
upper = safe_fillet(upper, upper.edges().filter_by(Axis.X), 12)
pivot = Pos(col_front - 10, 0, ARM_Z + 23) * (Rot(90, 0, 0) * Cylinder(16, 60))
head = Pos(XB + 12, 0, ARM_Z - 20) * Box(46, 40, 30, align=(Align.CENTER, Align.CENTER, Align.MIN))
tension = Pos(XB + 22, 0, ARM_Z + 46) * Cylinder(5, H - ARM_Z - 46 - 12, align=(Align.CENTER, Align.CENTER, Align.MIN))
tension_knob = Pos(XB + 22, 0, H - 14) * Cylinder(14, 14, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 鋸條（127 mm、上下夾座）
zb0 = ZT - 60
blade = Pos(XB, 0, zb0) * Box(0.5, 2.0, BLADE, align=(Align.CENTER, Align.CENTER, Align.MIN))
clamps = Pos(XB, 0, zb0 + BLADE - 6) * Box(10, 12, 16, align=(Align.CENTER, Align.CENTER, Align.MIN)) + \
         Pos(XB, 0, zb0 - 6) * Box(10, 12, 16, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 壓料腳＋吹屑管
holddown = Pos(XB - 30, 0, ZT + 25) * Cylinder(4, ARM_Z - 20 - ZT - 25, align=(Align.CENTER, Align.CENTER, Align.MIN))
foot = Pos(XB - 10, 0, ZT + 22) * Box(50, 30, 3) - Pos(XB, 0, ZT + 22) * Box(30, 6, 6)
blower = Pos(XB - 50, 15, ZT + 30) * Cylinder(3, ARM_Z - 20 - ZT - 30, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 開關、變速旋鈕（前右）
sw = Pos(XB - 120, -100, 70) * Box(40, 20, 26, align=(Align.CENTER, Align.CENTER, Align.MIN))
speed = Pos(XB - 60, -100, 85) * (Rot(90, 0, 0) * Cylinder(14, 16))

m.add(base + column + lower, "machine_gray", "body")
m.add(motor, "machine_gray", "motor")
m.add(upper + head + pivot, "machine_gray", "arm")
m.add(table + trunnion, "aluminum", "table")
m.add(insert + Compound(feet) + tilt_knob + tension_knob + speed, "black_plastic", "black")
m.add(blade, "blade", "blade")
m.add(clamps + tension + holddown + foot + blower, "steel", "steel")
m.add(sw, "yellow_plastic", "switch")

bb = Compound([base, column, upper, table, tension_knob, motor]).bounding_box()
m.dim("length", bb.size.X, "WEN 3921 說明書：26-3/8 in（670 mm）")
m.dim("width", bb.size.Y, "同上：13 in（330 mm）")
m.dim("height", bb.size.Z, "同上：14-3/4 in（375 mm）")
m.dim("throat", XB - col_front, "同上：喉深 16 in（406 mm）")
m.dim("blade_length", BLADE, "同上：鋸條 5 in（127 mm）")
m.dim("table_length", TBL_L, "WEN 3920：工作台 16 × 10 in")
m.export()
