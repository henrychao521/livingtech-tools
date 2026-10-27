"""桌上型鑽床（8 吋、5 段皮帶變速）。
尺寸：整機高 22.9 in（582 mm）、寬 7.5 in（190 mm）、深 11 in（279 mm，底座）；擺動直徑 8 in → 立柱中心到主軸 4 in（101.6 mm）；
主軸行程 2 in（50.8 mm）；夾頭 1/2 in（13 mm）JT33（WEN 4208T 規格與說明書）。
工作台 6.5 × 6.5 in（165 mm）；立柱直徑 46 mm、頭部與馬達尺寸為估計值。
擺法：主軸在前（-Y）、立柱在後、正面朝 -Y。
"""
from common import *

m = Model("drillpress", tol=0.08)
IN = 25.4
H_ALL, BW, BD = 22.9 * IN, 7.5 * IN, 11 * IN
SWING_R = 4 * IN
COL_D = 46.0
yc = BD / 2 - 45          # 立柱中心 y
ys = yc - SWING_R         # 主軸中心 y

base = Pos(0, 0, 0) * Box(BW, BD, 28, align=(Align.CENTER, Align.CENTER, Align.MIN))
base = safe_fillet(base, base.edges().group_by(Axis.Z)[-1], 6)
for x in (-35, 35):
    base -= Pos(x, -20, 28) * Box(12, 150, 10)          # 固定用長槽
base_boss = Pos(0, yc, 28) * Cylinder(42, 18, align=(Align.CENTER, Align.CENTER, Align.MIN))
column = Pos(0, yc, 40) * Cylinder(COL_D / 2, 420, align=(Align.CENTER, Align.CENTER, Align.MIN))

# 頭部鑄件（含立柱夾套）
head = Pos(0, (yc + 50 + ys - 48) / 2, 420) * Box(140, (yc + 50) - (ys - 48), 105, align=(Align.CENTER, Align.CENTER, Align.MIN))
head = safe_fillet(head, head.edges().filter_by(Axis.Z), 22)
head += Pos(0, ys, 405) * Cylinder(36, 20, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 皮帶蓋（上蓋往後蓋住馬達皮帶輪）
cover = Pos(0, (ys - 52 + yc + 150) / 2, 525) * Box(150, (yc + 150) - (ys - 52), H_ALL - 525, align=(Align.CENTER, Align.CENTER, Align.MIN))
cover = safe_fillet(cover, cover.edges().filter_by(Axis.Z), 40)
cover = safe_fillet(cover, cover.edges().group_by(Axis.Z)[-1], 8)
lid_knob = Pos(0, ys - 40, 560) * Box(30, 14, 12)
# 馬達（直立，在立柱後方）
motor = Pos(0, yc + 105, 395) * Cylinder(55, 130, align=(Align.CENTER, Align.CENTER, Align.MIN))
for i in range(6):
    motor -= Pos(0, yc + 105, 405 + i * 6) * (Cylinder(56, 2.5) - Cylinder(52, 2.5))
motor_cap = Pos(0, yc + 105, 380) * Cylinder(48, 15, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 主軸套筒、夾頭、鑽頭
quill = Pos(0, ys, 375) * Cylinder(25, 30, align=(Align.CENTER, Align.CENTER, Align.MIN))
chuck = Pos(0, ys, 320) * Cone(17, 20, 55, align=(Align.CENTER, Align.CENTER, Align.MIN))
for i in range(12):
    chuck -= Pos(0, ys, 357) * Rot(0, 0, i * 30) * Pos(20, 0, 0) * Box(3, 2, 12)
bit = Pos(0, ys, 250) * Cylinder(3.0, 70, align=(Align.CENTER, Align.CENTER, Align.MIN))
bit_tip = Pos(0, ys, 244) * Cone(0.4, 3.0, 6, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 進給手柄（右側，三支）
hub = Pos(70, ys + 40, 470) * (Rot(0, 90, 0) * Cylinder(22, 26, align=(Align.CENTER, Align.CENTER, Align.MIN)))
spokes, knobs = [], []
for i in range(3):
    a = 90 + i * 120
    sp = Pos(95, ys + 40, 470) * Rot(a, 0, 0) * Pos(0, 0, 55) * Cylinder(5, 110)
    spokes.append(sp)
    kn = Pos(95, ys + 40, 470) * Rot(a, 0, 0) * Pos(0, 0, 115) * Sphere(12)
    knobs.append(kn)
# 深度擋桿（左前）
depth = Pos(-48, ys - 10, 330) * Cylinder(5, 100, align=(Align.CENTER, Align.CENTER, Align.MIN))
# 開關盒
switch = Pos(-40, ys - 40, 470) * Box(36, 18, 46)
sw_btn = Pos(-40, ys - 50, 478) * Box(16, 4, 14)
# 工作台（方形）、支架、夾套
TBL = 6.5 * IN
table = Pos(0, ys, 205) * Box(TBL, TBL, 18, align=(Align.CENTER, Align.CENTER, Align.MIN))
table -= Pos(0, ys, 205) * Cylinder(10, 40)   # 中心孔
for x in (-40, 40):
    table -= Pos(x, ys, 223) * Box(10, 110, 10)
table_arm = Pos(0, (ys + yc) / 2, 175) * Box(50, yc - ys, 34, align=(Align.CENTER, Align.CENTER, Align.MIN))
table_rnd = Pos(0, ys, 175) * Cylinder(36, 30, align=(Align.CENTER, Align.CENTER, Align.MIN))
collar = Pos(0, yc, 160) * Cylinder(38, 64, align=(Align.CENTER, Align.CENTER, Align.MIN))
crank = Pos(40, yc - 10, 190) * (Rot(0, 90, 0) * Cylinder(4, 40, align=(Align.CENTER, Align.CENTER, Align.MIN))) \
    + Pos(80, yc - 10, 190) * (Rot(0, 90, 0) * Cylinder(10, 12, align=(Align.CENTER, Align.CENTER, Align.MIN)))

m.add(base + base_boss, "cast_iron", "base")
m.add(column, "chrome", "column")
m.add(head + cover, "machine_green", "head")
m.add(motor + motor_cap, "machine_gray", "motor")
m.add(table + table_arm + table_rnd + collar, "cast_iron", "table")
m.add(quill + chuck + bit + bit_tip + depth + Compound(spokes) + crank, "steel", "steel")
m.add(Compound(knobs) + hub + lid_knob + switch, "black_plastic", "black")
m.add(sw_btn, "red_plastic", "switch")

bb = Compound([base, column, head, cover, motor]).bounding_box()
m.dim("height", bb.size.Z, "WEN 4208T：高 22.9 in（582 mm）")
m.dim("base_width", BW, "WEN 4208T：寬 7.5 in（190 mm）")
m.dim("base_depth", BD, "WEN 4208T：深 11 in（279 mm）")
m.dim("column_to_spindle", yc - ys, "WEN 4208T：擺動直徑 8 in → 半徑 4 in（101.6 mm）")
m.dim("table_size", TBL, "WEN 4208T 商品頁：工作台 6.5 × 6.5 in")
m.dim("column_dia", COL_D, "估計")
m.export()
