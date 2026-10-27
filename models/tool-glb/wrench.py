"""活動扳手（呼び 200 mm）。
尺寸：全長 200 mm、最大口開き 24 mm（MCC モンキーレンチ H200 型錄；JIS B 4604 呼び 200 同級）；
鉗口與柄軸線夾 15°（活動扳手通例）。頭厚 13 mm、柄厚 9 mm 為常見值（估計）。
"""
import math
from common import *

m = Model("wrench", tol=0.04)
S = 18.0      # 展示時的口開（mm），最大 24
SMAX = 24.0
LJ = 21.0     # 鉗口深
TH, TB = 13.0, 9.0   # 頭厚、柄厚
ANG = 15.0

def head_local():
    """頭部（局部座標：x 沿鉗口深度方向、y 沿活動顎滑動方向；開口 y∈[0,S]）。"""
    body = extrude(Pos(-13, S / 2 - 3) * Circle(25), amount=TH / 2, both=True)
    fixed = slab([(-10, S), (LJ, S), (LJ + 3.5, S + 4), (LJ + 1, S + 10), (LJ - 8, S + 15),
                  (-6, S + 19), (-22, S + 14)], TH)
    body = body + fixed
    # 鉗口開口與活動顎所在處挖空
    body -= Pos(40, S / 2, 0) * Box(80, S, TH + 2)
    body -= Pos(40 - 3, -20, 0) * Box(80, 40, TH + 2)
    # 蝸桿窗口（貫穿）
    body -= Pos(-12, -11.5, 0) * Box(15, 17, TH + 2)
    return body

def jaw_local():
    j = slab([(-3, 0), (LJ - 1, 0), (LJ + 2, -3), (LJ - 3, -12), (5, -16), (-3, -14)], TH - 0.6)
    # 齒條（在頭內滑動，只露出一點）
    j += Pos(-12, -3, 0) * Box(10, 6, 6)
    return j

def worm_local():
    w = None
    for i in range(11):
        y = -19 + i * 1.5
        r = 6.4 if i % 2 == 0 else 5.4
        c = Pos(-12, y, 0) * (Rot(90, 0, 0) * Cylinder(r, 1.5))
        w = c if w is None else w + c
    w += Pos(-12, -11.5, 0) * (Rot(90, 0, 0) * Cylinder(2.0, 19))  # 軸
    return w

R = Rot(0, 0, ANG)
head = R * head_local()
jaw = R * Pos(0, S - S, 0) * jaw_local()
worm = R * worm_local()

# 柄：從頭部往 -X，漸縮，尾端圓弧＋吊孔
L_HANDLE_END = -168.5
handle = slab([(-25, -12), (-25, 11), (L_HANDLE_END, 8.5), (L_HANDLE_END, -8.5)], TB)
handle += Pos(L_HANDLE_END, 0, 0) * Cylinder(8.5, TB)
handle -= Pos(L_HANDLE_END + 1, 0, 0) * Cylinder(4.0, TB + 2)
handle = safe_fillet(handle, handle.faces().sort_by(Axis.Z)[-1].edges() + handle.faces().sort_by(Axis.Z)[0].edges(), 2.0)
head = head + handle
try:
    head = chamfer(head.edges().group_by(Axis.Z)[-1] + head.edges().group_by(Axis.Z)[0], 0.8)
except Exception as e:
    print("  chamfer skipped", e)

# 全長調到 200：量 X 方向總長（柄尾到鉗口尖），平移柄尾
bb = (head + jaw).bounding_box()
total = bb.size.X
print("raw total length", total)

# 立起來：板面朝 -Y（model-viewer 正面），長軸沿 X
UP = Rot(90, 0, 0)
cx = (bb.min.X + bb.max.X) / 2
place = Pos(-cx, 0, 0)
m.add(UP * place * head, "steel", "body")
m.add(UP * place * jaw, "steel", "jaw")
m.add(UP * place * worm, "dark_steel", "worm")

# 關鍵尺寸
m.dim("overall_length", total, "MCC モンキーレンチ H200 型錄：全長 200 mm")
m.dim("jaw_opening_shown", S, "展示開口；最大 24 mm（同上型錄）")
m.dim("jaw_angle_deg", ANG, "活動扳手鉗口與柄軸線約 15°（Wikipedia: Adjustable spanner）")
m.dim("head_thickness", TH, "常見值（估計）")
m.export()
