"""Arduino UNO R3 開發板。
外框 68.58 × 53.34 mm、板厚 1.6 mm、4 個 Ø3.2 mm 安裝孔位置：Arduino 官方 datasheet A000066 §5.4（Board Outline & Mounting Holes）。
排針位置：Arduino 開放硬體設計檔的慣用座標（0.1 in 格點；D7 與 D8 之間 0.16 in 的「不對齊」間距）。
USB-B、DC 電源座、ATmega328P（DIP-28）等元件尺寸為通用封裝尺寸，位置依官方外框圖示意。
擺法：元件面朝上（+Z），USB 與電源座朝 -X。原點在板子左下角，輸出時置中。
"""
from common import *

m = Model("microcontroller", tol=0.02)
IN = 25.4
BW, BH, T = 2.7 * IN, 2.1 * IN, 1.6
outline = [(0, 0), (66.04, 0), (68.58, 2.54), (68.58, 40.64), (66.04, 43.18), (66.04, 50.80), (63.5, 53.34), (0, 53.34)]
pcb = extrude(make_face(Polyline(*outline, close=True)), amount=T)
HOLES = [(0.55 * IN, 0.1 * IN), (0.6 * IN, 2.0 * IN), (2.6 * IN, 0.3 * IN), (2.6 * IN, 1.4 * IN)]
for x, y in HOLES:
    pcb -= Pos(x, y, 0) * Cylinder(1.6, 10)
parts = {"pcb_teal": [pcb], "black_plastic": [], "steel": [], "ic_black": [], "brass": [], "silver_label": [], "led_green": [], "hole_dark": []}

def female_header(x0, y, n):
    """母排針：x0 為第一腳中心，沿 +X 排 n 腳。"""
    h = Pos(x0 + (n - 1) * 2.54 / 2, y, T) * Box(n * 2.54, 2.54, 8.5, align=(Align.CENTER, Align.CENTER, Align.MIN))
    for i in range(n):
        h -= Pos(x0 + i * 2.54, y, T + 8.5) * Box(1.0, 1.0, 3.0)
    parts["black_plastic"].append(h)
    parts["hole_dark"].append(Pos(x0 + (n - 1) * 2.54 / 2, y, T + 8.5 - 2.6) * Box(n * 2.54 - 1.0, 1.4, 0.4))

# 上緣：SCL SDA AREF GND D13–D8（10 腳，0.84–1.74 in）、D7–D0（8 腳，1.90–2.60 in）
female_header(0.84 * IN, 2.0 * IN, 10)
female_header(1.90 * IN, 2.0 * IN, 8)
# 下緣：電源 8 腳（0.9–1.6 in）、類比 A0–A5（2.0–2.5 in）
female_header(0.9 * IN, 0.1 * IN, 8)
female_header(2.0 * IN, 0.1 * IN, 6)

# USB-B 母座（凸出板緣 6.35 mm）
usb = Pos(-6.35 + 8.0, 38.1, T) * Box(16.0, 12.0, 10.9, align=(Align.CENTER, Align.CENTER, Align.MIN))
usb -= Pos(-6.35, 38.1, T + 5.45) * Box(4.0, 8.0, 7.2)
parts["steel"].append(usb)
parts["hole_dark"].append(Pos(-6.0, 38.1, T + 5.45) * Box(0.6, 7.6, 6.8))
# DC 電源座（黑色）
jack = Pos(-1.8 + 6.85, 7.62, T) * Box(13.7, 9.0, 11.0, align=(Align.CENTER, Align.CENTER, Align.MIN))
jack -= Pos(-1.8, 7.62, T + 6.5) * (Rot(0, 90, 0) * Cylinder(3.2, 8))
parts["black_plastic"].append(jack)
# ATmega328P DIP-28 ＋ IC 腳座
cx, cy = 47.0, 15.5
sock = Pos(cx, cy, T) * Box(36.0, 10.2, 3.0, align=(Align.CENTER, Align.CENTER, Align.MIN))
parts["black_plastic"].append(sock)
chip = Pos(cx, cy, T + 3.0) * Box(34.7, 7.4, 3.4, align=(Align.CENTER, Align.CENTER, Align.MIN))
chip -= Pos(cx - 17.35, cy, T + 6.4) * Cylinder(1.0, 1.2)  # 缺口
parts["ic_black"].append(chip)
for i in range(14):
    x = cx - 6.5 * 2.54 + i * 2.54
    for s in (1, -1):
        parts["steel"].append(Pos(x, cy + s * 3.95, T + 3.6) * Box(0.5, 0.6, 1.6))
# ATmega16U2（USB 轉序列，QFN）
parts["ic_black"].append(Pos(17.5, 30.5, T) * Box(5.0, 5.0, 0.9, align=(Align.CENTER, Align.CENTER, Align.MIN)))
# ICSP 2×3 公排針（右側中段）
icsp = Pos(64.0, 27.0, T) * Box(5.08, 7.62, 2.5, align=(Align.CENTER, Align.CENTER, Align.MIN))
parts["black_plastic"].append(icsp)
for i in range(2):
    for j in range(3):
        parts["brass"].append(Pos(64.0 - 1.27 + i * 2.54, 27.0 - 2.54 + j * 2.54, T + 2.5) * Box(0.64, 0.64, 6.0, align=(Align.CENTER, Align.CENTER, Align.MIN)))
# 16 MHz 石英振盪器（HC-49/S）
xtal = Pos(32.0, 30.0, T) * Box(11.0, 4.6, 3.6, align=(Align.CENTER, Align.CENTER, Align.MIN))
xtal = safe_fillet(xtal, xtal.edges().filter_by(Axis.Z), 2.2)
parts["silver_label"].append(xtal)
# 重置按鈕
btn = Pos(6.5, 49.0, T) * Box(6.0, 6.0, 3.5, align=(Align.CENTER, Align.CENTER, Align.MIN))
parts["steel"].append(btn)
parts["black_plastic"].append(Pos(6.5, 49.0, T + 3.5) * Cylinder(1.7, 1.5, align=(Align.CENTER, Align.CENTER, Align.MIN)))
# 穩壓 IC（SOT-223）與兩顆電解電容
parts["ic_black"].append(Pos(18.0, 3.6, T) * Box(6.5, 3.5, 1.7, align=(Align.CENTER, Align.CENTER, Align.MIN)))
parts["steel"].append(Pos(18.0, 6.2, T) * Box(3.0, 1.6, 1.0, align=(Align.CENTER, Align.CENTER, Align.MIN)))
for x, y in ((24.0, 9.0), (24.0, 16.5)):
    cap = Pos(x, y, T) * Cylinder(3.15, 5.4, align=(Align.CENTER, Align.CENTER, Align.MIN))
    parts["steel"].append(cap)
    parts["black_plastic"].append(Pos(x, y, T) * Box(6.6, 6.6, 1.2, align=(Align.CENTER, Align.CENTER, Align.MIN)))
# LED（ON、L、TX、RX）
for x, y in ((47.5, 31.0), (24.0, 44.0), (24.0, 40.5), (24.0, 38.5)):
    parts["led_green"].append(Pos(x, y, T) * Box(1.6, 0.8, 0.6, align=(Align.CENTER, Align.CENTER, Align.MIN)))

ox, oy = -BW / 2, -BH / 2
for mat, shapes in parts.items():
    if shapes:
        m.add(Pos(ox, oy, 0) * Compound(shapes), mat, mat)

m.dim("board_length", BW, "Arduino A000066 datasheet §5.4：2700 mil（68.58 mm）；官方規格表 68.6 mm")
m.dim("board_width", BH, "同上：2100 mil（53.34 mm）")
m.dim("mount_hole_dia", 3.2, "同上：4 × Ø3.20 mm")
m.dim("hole_spacing_x_right", 2.6 * IN, "同上：左緣到右側兩孔 2600 mil")
m.dim("pcb_thickness", T, "常見 FR-4 板厚 1.6 mm")
m.export()
