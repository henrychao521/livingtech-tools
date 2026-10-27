"""桌上型砂帶砂盤機（帶盤式）。
規格：砂帶 4 × 36 in（101.6 × 914.4 mm）、砂盤直徑 6 in（152.4 mm）、集塵口 2.25 in（WEN 6502T 規格）。
砂帶輪中心距由砂帶周長反算：2c + πD = 914.4 mm，D = 51 mm（估計）→ c = 377 mm。
底座、馬達、工作台尺寸為估計值。擺法：砂帶水平在左上方、砂盤在右端面朝 +X、正面朝 -Y。
"""
import math
from common import *

m = Model("sander", tol=0.08)
IN = 25.4
BELT_W, BELT_L, DISC_D = 4 * IN, 36 * IN, 6 * IN
D_DRUM = 51.0
C = (BELT_L - math.pi * (D_DRUM + 1.2)) / 2    # 中心距（以砂帶中線周長計）
T_BELT = 1.2
ZC = 220.0                                   # 砂帶輪中心高度
XR = 20.0                                    # 右側（主動）輪 x，在馬達上方，不蓋住砂盤
XL = XR - C

base = Pos(-130, 0, 0) * Box(520, 260, 32, align=(Align.CENTER, Align.CENTER, Align.MIN))
base = safe_fillet(base, base.edges().filter_by(Axis.Z), 15)
base = safe_fillet(base, base.edges().group_by(Axis.Z)[-1], 5)
feet = [Pos(x, y, 0) * Cylinder(12, 8, align=(Align.CENTER, Align.CENTER, Align.MAX)) for x in (-370, 110) for y in (-110, 110)]
# 馬達（軸沿 X）
MZ = 112.0
motor = Pos(-10, 30, MZ) * (Rot(0, 90, 0) * Cylinder(66, 150))
for i in range(8):
    motor -= Pos(-75 + i * 8, 30, MZ) * (Rot(0, 90, 0) * (Cylinder(68, 3) - Cylinder(63, 3)))
motor_foot = Pos(-20, 30, 32) * Box(140, 110, 30, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 砂盤（右端，面朝 +X）＋護罩＋集塵口
xd = 75.0
disc = Pos(xd, 30, MZ) * (Rot(0, 90, 0) * Cylinder(DISC_D / 2, 10, align=(Align.CENTER, Align.CENTER, Align.MIN)))
paper = Pos(xd + 10, 30, MZ) * (Rot(0, 90, 0) * Cylinder(DISC_D / 2 - 1, 1.0, align=(Align.CENTER, Align.CENTER, Align.MIN)))
guard = Pos(xd - 8, 30, MZ) * (Rot(0, 90, 0) * (Cylinder(DISC_D / 2 + 8, 22, align=(Align.CENTER, Align.CENTER, Align.MIN)) - Cylinder(DISC_D / 2 + 3, 30, align=(Align.CENTER, Align.CENTER, Align.MIN))))
guard = guard - Pos(xd, 30, MZ + 100) * Box(80, 260, 200)          # 只留下半圈
guard += Pos(xd - 8, 30, MZ) * (Rot(0, 90, 0) * Cylinder(DISC_D / 2 + 8, 4, align=(Align.CENTER, Align.CENTER, Align.MIN))) - Pos(xd, 30, MZ + 100) * Box(80, 260, 200)
dust = Pos(xd + 4, 30 + 70, MZ - 60) * (Rot(-90, 0, 0) * Cylinder(2.25 * IN / 2, 50, align=(Align.CENTER, Align.CENTER, Align.MIN)))
dust -= Pos(xd + 4, 30 + 70, MZ - 60) * (Rot(-90, 0, 0) * Cylinder(2.25 * IN / 2 - 3, 60, align=(Align.CENTER, Align.CENTER, Align.MIN)))
# 砂盤工作台（在砂盤前方、比中心略低）
table = Pos(xd + 12 + 75, 30, MZ - 18) * Box(150, 230, 12, align=(Align.CENTER, Align.CENTER, Align.MAX))
table -= Pos(xd + 12 + 50, 30, MZ - 18) * Box(12, 200, 8)          # 斜角規槽
tbl_brk = Pos(xd + 40, 30, 32) * Box(30, 60, MZ - 18 - 12 - 32, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 砂帶組（水平）：兩輪＋環形砂帶＋側板＋擋板
def stadium(r):
    return Pos((XL + XR) / 2, 0) * SlotCenterToCenter(C, 2 * r)
belt = extrude(Plane.XZ * Pos(0, ZC) * (stadium(D_DRUM / 2 + T_BELT) - stadium(D_DRUM / 2)), amount=BELT_W / 2, both=True)
drums = [Pos(x, 0, ZC) * (Rot(90, 0, 0) * Cylinder(D_DRUM / 2, BELT_W + 6)) for x in (XL, XR)]
platen = Pos((XL + XR) / 2, 0, ZC + D_DRUM / 2 - 5) * Box(C - 40, BELT_W - 4, 8)
side = Pos((XL + XR) / 2, BELT_W / 2 + 6, ZC) * Box(C + 30, 6, 70)
side = safe_fillet(side, side.edges().filter_by(Axis.Y), 25)
backstop = Pos(XL - D_DRUM / 2 - 8, 0, ZC + 20) * Box(8, BELT_W + 30, 60)
track = Pos(XL, BELT_W / 2 + 18, ZC) * (Rot(-90, 0, 0) * Cylinder(15, 16, align=(Align.CENTER, Align.CENTER, Align.MIN)))
arm = Pos(-40, 50, (MZ + ZC) / 2 + 10) * Box(70, 40, ZC - MZ - 40)
lock = Pos(-40, 75, (MZ + ZC) / 2 + 10) * (Rot(-90, 0, 0) * Cylinder(16, 18, align=(Align.CENTER, Align.CENTER, Align.MIN)))
switch = Pos(-300, -130, 20) * Box(60, 14, 26) + Pos(-300, -138, 22) * Box(30, 4, 16)

m.add(base, "cast_iron", "base")
m.add(motor + motor_foot + guard + arm + tbl_brk, "machine_gray", "body")
m.add(side + backstop, "machine_gray", "beltframe")
m.add(disc + Compound(drums) + platen, "aluminum", "alu")
m.add(paper + belt, "sandpaper", "abrasive")
m.add(table, "aluminum", "table")
m.add(dust + track + lock + Compound(feet), "black_plastic", "black")
m.add(switch, "yellow_plastic", "switch")

bb = Compound([base, motor, belt, side, backstop, table, disc]).bounding_box()
m.dim("belt_width", BELT_W, "WEN 6502T：砂帶 4 × 36 in")
m.dim("belt_loop_length", 2 * C + math.pi * (D_DRUM + T_BELT), "同上：36 in（914 mm）；以帶中線計算")
m.dim("disc_diameter", DISC_D, "WEN 6502T：砂盤 6 in")
m.dim("dust_port", 2.25 * IN, "WEN 6502T：集塵口 2.25 in")
m.dim("overall_L", bb.size.X, "估計")
m.dim("overall_H", bb.size.Z, "估計")
m.export()
