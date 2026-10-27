"""麵包板 830 孔（全尺寸）。
尺寸：165.1 × 54.6 × 8.5 mm（Arrow：BusBoard BB830）；830 孔＝630 孔 IC 區＋兩條 100 孔電源排（BusBoard BB830 datasheet Rev 7）；
孔距 2.54 mm（0.1 in）、中央溝兩側 e、f 列相距 7.62 mm（0.3 in，DIP 跨距）。孔口 1.2 mm 方孔、溝寬 3 mm 為示意。
擺法：板面朝上（+Z），長邊沿 X。
"""
from common import *

m = Model("breadboard", tol=0.03)
L, W, H = 165.1, 54.6, 8.5
P = 2.54
NCOL = 63
HOLE, DEPTH = 1.2, 1.4

body = Box(L, W, H, align=(Align.CENTER, Align.CENTER, Align.MIN))
body = safe_fillet(body, body.edges().filter_by(Axis.Z), 1.0)
xs = [(i - (NCOL - 1) / 2) * P for i in range(NCOL)]
ys_main = [P * 1.5 + k * P for k in range(5)]                  # f..j（e..a 鏡像）
ys_main = [-y for y in reversed(ys_main)] + ys_main
y_rail = [20.32, 22.86]
rail_x = []
for g in range(10):                                             # 10 組 × 5 孔 = 50 孔
    for k in range(5):
        rail_x.append((g * 6 + k - 29.5 + 0.5) * P)
holes = []
for x in xs:
    for y in ys_main:
        holes.append((x, y))
for y in y_rail:
    for x in rail_x:
        holes.append((x, y)); holes.append((x, -y))
print("holes:", len(holes))
cut = None
pockets = [Pos(x, y, H - DEPTH / 2 + 0.01) * Box(HOLE, HOLE, DEPTH) for x, y in holes]
cut = Compound(pockets)
body = body - cut
# 中央溝
body = body - Pos(0, 0, H - 1.0) * Box(L - 6, 3.0, 2.2)
# 孔底深色（看起來像孔）
dark = Pos(0, 0, H - 1.2) * Box(L - 4, W - 4, 0.3, align=(Align.CENTER, Align.CENTER, Align.MAX))  # 頂面在孔底上方 0.2 mm，從孔口看是黑的
# 電源排紅藍線（+ 紅、- 藍）
lines = []
for s in (1, -1):
    lines.append(("rail_red", Pos(0, s * (y_rail[1] + 2.0), H + 0.02) * Box(152, 0.7, 0.06)))
    lines.append(("rail_blue", Pos(0, s * (y_rail[0] - 2.0), H + 0.02) * Box(152, 0.7, 0.06)))
m.add(body, "white_plastic", "body")
m.add(dark, "hole_dark", "dark")
red = Compound([g for c, g in lines if c == "rail_red"]); blue = Compound([g for c, g in lines if c == "rail_blue"])
m.add(red, "rail_red", "red"); m.add(blue, "rail_blue", "blue")

m.dim("length", L, "Arrow 型錄：BusBoard BB830 165.1 × 54.6 × 8.5 mm")
m.dim("width", W, "同上")
m.dim("height", H, "同上")
m.dim("tie_points", len(holes), "BusBoard BB830 datasheet：830 孔（630＋2×100）")
m.dim("pitch", P, "0.1 in 標準孔距")
m.dim("dip_gap_e_to_f", ys_main[5] - ys_main[4], "0.3 in DIP 跨距")
m.export()
