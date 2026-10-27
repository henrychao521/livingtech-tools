"""FDM 3D 印表機（Ender-3 型：龍門 Z 軸、熱床走 Y、Bowden 遠端擠出）。
尺寸：整機約 440 × 440 × 465 mm、列印範圍 220 × 220 × 250 mm（3dprinting.com Creality Ender-3 規格）；
熱床 235 × 235 mm、線材 1.75 mm、噴嘴 0.4 mm（Ender-3 常見規格）。鋁擠型 2020／2040／4040 為通用斷面。
其餘零件位置依整機尺寸分配（估計）。擺法：正面（操作面、螢幕）朝 -Y。
"""
import math
from common import *

m = Model("printer3d", tol=0.15)
FW = 350.0          # 兩側立柱外距
Z_TOP = 465.0
alu, black, steel, alum, red, white, brass = [], [], [], [], [], [], []

def ext(p, q, a, b):
    """鋁擠型：p→q 中心線，斷面 a×b（a 沿第一個垂直軸）。"""
    p, q = Vector(*p), Vector(*q)
    d = q - p; L = d.length
    if abs(d.Z) > 1e-6 and abs(d.X) < 1e-6 and abs(d.Y) < 1e-6:
        b_ = Box(a, b, L)
    elif abs(d.X) > 1e-6:
        b_ = Box(L, b, a)
    else:
        b_ = Box(a, L, b)
    c = (p + q) * 0.5
    return Pos(c.X, c.Y, c.Z) * b_

# 底座：左右側軌 2040（平躺）、中央 Y 軌 4040、前後橫樑 2040
for x in (-FW / 2 + 20, FW / 2 - 20):
    alu.append(ext((x, -190, 10), (x, 190, 10), 40, 20))
alu.append(ext((0, -190, 20), (0, 190, 20), 40, 40))
for y in (-170, 170):
    alu.append(ext((-FW / 2 + 40, y, 10), (FW / 2 - 40, y, 10), 20, 40))
# 立柱 2040、頂橫樑 2040
for x in (-FW / 2 + 10, FW / 2 - 10):
    alu.append(ext((x, 0, 20), (x, 0, Z_TOP - 20), 20, 40))
alu.append(ext((-FW / 2, 0, Z_TOP - 10), (FW / 2, 0, Z_TOP - 10), 20, 40))
# 熱床（235×235）＋ Y 托架＋調平旋鈕
ZB = 72.0
bed = Pos(0, 0, ZB) * Box(235, 235, 3, align=(Align.CENTER, Align.CENTER, Align.MIN))
sheet = Pos(0, 0, ZB + 3) * Box(235, 235, 1, align=(Align.CENTER, Align.CENTER, Align.MIN))
carriage = Pos(0, 0, ZB - 32) * Box(150, 190, 6, align=(Align.CENTER, Align.CENTER, Align.MIN))
alum += [bed, carriage]
black.append(sheet)
for sx in (-1, 1):
    for sy in (-1, 1):
        black.append(Pos(sx * 100, sy * 100, ZB - 26) * Cylinder(14, 10))      # 調平輪
        steel.append(Pos(sx * 100, sy * 100, ZB - 16) * (Cylinder(4, 20) - Cylinder(1, 30)))
# 正在列印的小零件（PLA）
# X 龍門（2020）＋ X 馬達＋列印頭
ZX = 190.0
pla = Pos(0, -55, ZB + 4) * Box(30, 30, ZX - 64 - 6 - ZB - 4 - 0.4, align=(Align.CENTER, Align.CENTER, Align.MIN))  # 正在列印的零件
alu.append(ext((-FW / 2 + 20, -30, ZX), (FW / 2 - 20, -30, ZX), 20, 20))
black.append(Pos(-FW / 2 + 5, -55, ZX) * Box(42, 42, 40))                       # X 馬達
black.append(Pos(-FW / 2 + 5, -30, ZX) * Box(50, 16, 70))                       # 左側 Z 托架
black.append(Pos(FW / 2 - 5, -30, ZX) * Box(30, 16, 60))
head = Pos(0, -55, ZX - 20) * Box(46, 40, 62)
head = safe_fillet(head, head.edges().filter_by(Axis.Z), 5)
black.append(head)
alum.append(Pos(0, -55, ZX - 64) * Box(22, 20, 14, align=(Align.CENTER, Align.CENTER, Align.MIN)))   # 加熱塊
brass.append(Pos(0, -55, ZX - 64) * Cone(0.4, 3.5, 6, align=(Align.CENTER, Align.CENTER, Align.MAX)))  # 噴嘴
white.append(Pos(0, -35, ZX - 10) * Box(30, 6, 30))                              # 風扇蓋
# Z 軸：馬達＋導螺桿＋銅螺帽
black.append(Pos(-FW / 2 + 5, -30, 45) * Box(42, 42, 40))
steel.append(Pos(-FW / 2 + 5, -30, 65) * Cylinder(4, Z_TOP - 120, align=(Align.CENTER, Align.CENTER, Align.MIN)))
brass.append(Pos(-FW / 2 + 5, -30, ZX - 12) * Cylinder(11, 4) + Pos(-FW / 2 + 5, -30, ZX - 4) * Cylinder(6, 12))
# 擠出機（Bowden，左立柱上）＋鐵氟龍管
EX = Vector(-FW / 2 - 20, 0, 320)
black.append(Pos(EX.X, EX.Y, EX.Z) * Box(40, 42, 42))
red.append(Pos(EX.X, EX.Y - 26, EX.Z + 6) * Box(40, 10, 40))
path = Spline((EX.X, EX.Y - 26, EX.Z + 26), (EX.X + 20, -30, EX.Z + 100), (-60, -60, ZX + 150), (0, -55, ZX + 11))
prof = Plane(origin=path @ 0, z_dir=path % 0) * Circle(2.0)
white.append(sweep(prof, path))
# 料架（頂樑上）
black.append(Pos(0, 20, Z_TOP - 10) * Box(30, 20, 20))
steel.append(Pos(0, 75, Z_TOP - 10) * (Rot(90, 0, 0) * Cylinder(6, 90)))
# 電源供應器（右側）與控制盒＋螢幕（前右）
PSU = Pos(FW / 2 + 25, 40, 150) * Box(50, 115, 215)
black.append(PSU)
black.append(Pos(FW / 2 - 40, -190, 40) * Box(100, 20, 60))
lcd_box = Pos(FW / 2 - 70, -205, 35) * Rot(-20, 0, 0) * Box(98, 20, 64)
black.append(lcd_box)
white.append(Pos(FW / 2 - 78, -216, 37) * Rot(-20, 0, 0) * Box(62, 1.0, 46))
steel.append(Pos(FW / 2 - 33, -216, 37) * Rot(-20, 0, 0) * (Rot(90, 0, 0) * Cylinder(8, 12)))
# Y 馬達（後）與皮帶
black.append(Pos(0, 205, 25) * Box(42, 30, 42))
black.append(Pos(0, 0, 41) * Box(6, 380, 2))
black.append(Pos(0, -45, ZX + 12) * Box(FW - 60, 2, 6))

m.add(Compound(alu), "black_alu", "frame")
m.add(Compound(black), "black_plastic", "black")
m.add(Compound(alum), "aluminum", "alu")
m.add(Compound(steel), "steel", "steel")
m.add(Compound(brass), "brass", "brass")
m.add(Compound(red), "red_plastic", "red")
m.add(Compound(white), "pla_white", "white")
m.add(pla, "pla_orange", "print")

allc = Compound(alu + black + alum + steel + white)
bb = allc.bounding_box()
print("bbox", bb.min, bb.max)
m.dim("width", bb.size.X, "3dprinting.com Ender-3：440 mm")
m.dim("depth", bb.size.Y, "同上：440 mm")
m.dim("height", bb.size.Z, "同上：465 mm")
m.dim("bed_size", 235, "Ender-3 熱床 235 × 235 mm（列印範圍 220 × 220）")
m.dim("z_build_height", 250, "列印高度 250 mm（龍門行程，示意位置 Z=190）")
m.export()
