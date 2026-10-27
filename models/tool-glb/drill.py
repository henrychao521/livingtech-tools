"""18V 充電式起子電鑽（手電鑽）。
外形尺寸：長 169 × 寬 79 × 高 255 mm（含電池）、夾頭容量 1.5–13 mm 免鑰匙夾頭
（Makita DDF485 規格；Lectura specs 與經銷商規格表一致）。
電池約 113 × 76 × 64 mm（18V 3.0Ah 滑軌式電池常見值，估計）；其餘斷面依整機尺寸分配（估計）。
外觀不仿任何品牌標誌。擺法：夾頭朝 +X、正面（-Y）看到側面。
"""
import math
from common import *

m = Model("drill", tol=0.06)
L, W, H = 169.0, 79.0, 255.0

# 電池
bat = Pos(66.5, 0, 0) * Box(113, 76, 64, align=(Align.CENTER, Align.CENTER, Align.MIN))
bat = safe_fillet(bat, bat.edges().filter_by(Axis.Z), 8)
bat_band = Pos(66.5, 0, 46) * Box(113.6, 76.6, 4, align=(Align.CENTER, Align.CENTER, Align.MIN))
bat_band = safe_fillet(bat_band, bat_band.edges().filter_by(Axis.Z), 8)
bat_btn = Pos(124, 0, 52) * Box(4, 30, 8)
# 握把底座（電池座）
foot = Pos(64, 0, 64) * Box(112, W, 22, align=(Align.CENTER, Align.CENTER, Align.MIN))
foot = safe_fillet(foot, foot.edges().filter_by(Axis.Z), 10)
led = Pos(119.5, 0, 76) * (Rot(0, 90, 0) * Cylinder(4, 2))
# 握把：橢圓斷面放樣，往前下方傾
grip = loft([Pos(60, 0, 84) * Ellipse(24, 18), Pos(52, 0, 130) * Ellipse(21, 16.5), Pos(45, 0, 192) * Ellipse(23, 17)])
grip_rubber = loft([Pos(53, 0, 92) * Ellipse(20, 17.6), Pos(45, 0, 130) * Ellipse(18, 17.0), Pos(38, 0, 182) * Ellipse(18, 17.4)])
grip_rubber = grip_rubber - Pos(80, 0, 130) * Box(60, 60, 140)   # 只留握把後半
# 機身（馬達＋齒輪箱）：沿 X 放樣
def sec(x, w, h, z):
    return Plane.YZ.offset(x) * Pos(0, z) * Ellipse(w / 2, h / 2)
body = loft([sec(0.0, 30, 40, 222), sec(8, 54, 62, 222), sec(30, 60, 67, 221.5), sec(85, 60, 66, 221.5), sec(112, 56, 56, 221), sec(120, 54, 52, 221)])
# 散熱孔
for i in range(5):
    body -= Pos(14 + i * 6, 0, 222) * Box(2.5, 70, 20)
selector = Pos(92, 0, 253) * Box(18, 12, 4)
selector = safe_fillet(selector, selector.edges().group_by(Axis.Z)[-1], 1.5)
fr = Pos(66, 0, 188) * (Rot(90, 0, 0) * Cylinder(4, 64))
trigger = slab([(60, 152), (74, 156), (76, 184), (62, 186)], 16, plane=Plane.XZ)
# 扭力環（離合器）
clutch = Pos(119, 0, 221) * (Rot(0, 90, 0) * Cylinder(27, 13, align=(Align.CENTER, Align.CENTER, Align.MIN)))
for i in range(24):
    a = i * 15
    clutch -= Pos(125.5, 0, 221) * Rot(a, 0, 0) * Pos(0, 0, 27) * Box(14, 2.2, 2.4)
# 夾頭（免鑰匙）
chuck = loft([sec(132, 44, 44, 221), sec(150, 44, 44, 221), sec(163, 38, 38, 221)])
for i in range(18):
    chuck -= Pos(141, 0, 221) * Rot(i * 20, 0, 0) * Pos(0, 0, 22) * Box(16, 2.0, 2.0)
nose = Pos(163, 0, 221) * (Rot(0, 90, 0) * Cone(16, 9, 6, align=(Align.CENTER, Align.CENTER, Align.MIN)))
nose -= Pos(168, 0, 221) * (Rot(0, 90, 0) * Cylinder(5.5, 10))
jaws = [Pos(166, 0, 221) * Rot(i * 120, 0, 0) * Pos(0, 0, 3.6) * Box(5, 2.2, 3.0) for i in range(3)]
shaft = Pos(126, 0, 221) * (Rot(0, 90, 0) * Cylinder(10, 8, align=(Align.CENTER, Align.CENTER, Align.MIN)))

m.add(body + grip + foot, "teal_body", "housing")
m.add(grip_rubber + bat + bat_btn, "black_plastic", "rubber_battery")
m.add(bat_band, "silver_label", "band")
m.add(trigger + fr + selector, "black_plastic", "controls")
m.add(clutch, "black_plastic", "clutch")
m.add(chuck, "rubber", "chuck")
m.add(nose + Compound(jaws) + shaft, "steel", "nose")
m.add(led, "white_plastic", "led")

bb = Compound([body, grip, foot, bat, chuck, nose]).bounding_box()
m.dim("length", bb.size.X, "Makita DDF485 規格：長 169 mm")
m.dim("width", bb.size.Y, "同上：寬 79 mm")
m.dim("height", bb.size.Z, "同上：高 255 mm（含電池）")
m.dim("chuck_capacity_max", 13, "同上：夾頭 1.5–13 mm")
m.export()
