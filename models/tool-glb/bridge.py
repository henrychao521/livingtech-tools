"""普拉特（Pratt）下承式鐵路桁架橋（單跨，示意實尺）。
與頁面 2D 圖一致：6 個節間、端斜桿傾斜、斜桿由上弦往跨中向下（受拉）、豎桿受壓、一端鉸支承、一端滾支承。
尺寸：節間 6.0 m × 6 = 跨徑 36 m、桁高 7.2 m → 斜桿與水平夾 50.2°，落在「斜桿宜 50°–60°、節間取偶數」
（NIT Srinagar 土木系講義《Truss Bridges》）。軌距 1067 mm（臺鐵）。桁距 5.0 m、桿件斷面為估計值。
單位：mm（輸出時換公尺）。
"""
import math
from common import *

m = Model("bridge", tol=6.0, ang=0.4)
PANEL, NP, DEPTH, B = 6000.0, 6, 7200.0, 5000.0
SPAN = PANEL * NP
X = [(-SPAN / 2) + i * PANEL for i in range(NP + 1)]   # 下弦節點
TOPX = X[1:-1]                                           # 上弦節點（端斜桿）

def member(p, q, w, h, rot=0):
    """兩點之間的方形斷面桿件（w：桁面內寬、h：垂直桁面厚）。"""
    p, q = Vector(*p), Vector(*q)
    d = q - p
    L = d.length
    b = Box(L, h, w)   # 長軸沿 X、Y 為出平面
    ang = math.degrees(math.atan2(d.Z, d.X))
    mid = (p + q) * 0.5
    return Pos(mid.X, mid.Y, mid.Z) * Rot(0, -ang, 0) * b

steel, gussets = [], []
for yt in (-B / 2, B / 2):
    def P(x, z):
        return (x, yt, z)
    # 下弦（受拉）、上弦（受壓）
    steel.append(member(P(X[0], 0), P(X[-1], 0), 500, 450))
    steel.append(member(P(TOPX[0], DEPTH), P(TOPX[-1], DEPTH), 560, 500))
    # 端斜桿
    steel.append(member(P(X[0], 0), P(TOPX[0], DEPTH), 560, 500))
    steel.append(member(P(X[-1], 0), P(TOPX[-1], DEPTH), 560, 500))
    # 豎桿
    for x in TOPX:
        steel.append(member(P(x, 0), P(x, DEPTH), 380, 380))
    # 斜桿（Pratt：上弦節點往跨中、往下）
    mid = len(X) // 2
    for i in range(1, mid):
        steel.append(member(P(X[i], DEPTH), P(X[i + 1], 0), 300, 220))
    for i in range(mid + 1, len(X) - 1):
        steel.append(member(P(X[i], DEPTH), P(X[i - 1], 0), 300, 220))
    # 節點板
    for x in X:
        gussets.append(Pos(x, yt, 300) * Box(1300, 520, 1100))
    for x in TOPX:
        gussets.append(Pos(x, yt, DEPTH - 250) * Box(1300, 560, 1000))

# 橫梁（每個下弦節點）與縱梁
for x in X:
    steel.append(Pos(x, 0, -250) * Box(400, B, 800))
for yy in (-900, 900):
    steel.append(Pos(0, yy, -100) * Box(SPAN, 300, 600))
# 上橫撐與上橫向斜撐
for x in TOPX:
    steel.append(Pos(x, 0, DEPTH + 150) * Box(300, B, 400))
for i in range(len(TOPX) - 1):
    xa, xb = TOPX[i], TOPX[i + 1]
    for s in (1, -1):
        d = Vector(xb - xa, s * B, 0)
        Lh = d.length
        a = math.degrees(math.atan2(d.Y, d.X))
        steel.append(Pos((xa + xb) / 2, 0, DEPTH + 150) * Rot(0, 0, a) * Box(Lh, 160, 160))
# 門型框（端斜桿頂部橫撐）
for xe, xt in ((X[0], TOPX[0]), (X[-1], TOPX[-1])):
    for f in (0.72, 0.9):
        x = xe + (xt - xe) * f
        steel.append(Pos(x, 0, DEPTH * f) * Box(350, B, 450))

# 軌枕與鋼軌（軌距 1067 mm）
ties = [Pos(x, 0, 330) * Box(200, 2000, 140) for x in [(-SPAN / 2) + 300 + i * 600 for i in range(int(SPAN / 600))]]
rails = [Pos(0, s * (1067 / 2 + 36), 470) * Box(SPAN + 400, 70, 150) for s in (1, -1)]

# 支承：左鉸（三角座）、右滾（滾軸）
sup = []
for yt in (-B / 2, B / 2):
    tri = extrude(Plane.XZ * make_face(Polyline((-500, -1300), (500, -1300), (0, -300), close=True)), amount=350, both=True)
    sup.append(Pos(X[0], yt, 0) * tri)
    sup.append(Pos(X[0], yt, -300) * (Rot(90, 0, 0) * Cylinder(180, 700)))
    tri2 = extrude(Plane.XZ * make_face(Polyline((-450, -950), (450, -950), (0, -300), close=True)), amount=350, both=True)
    sup.append(Pos(X[-1], yt, 0) * tri2)
    for dx in (-300, 0, 300):
        sup.append(Pos(X[-1] + dx, yt, -1130) * (Rot(90, 0, 0) * Cylinder(170, 700)))
    sup.append(Pos(X[-1], yt, -1350) * Box(1300, 800, 100))
# 橋台（混凝土）
abut = [Pos(X[0] - 1200, 0, -2300) * Box(4200, B + 2400, 2000),
        Pos(X[-1] + 1200, 0, -2400) * Box(4200, B + 2400, 2000)]

m.add(Compound(steel), "bridge_steel", "steel")
m.add(Compound(gussets), "bridge_steel", "gussets")
m.add(Compound(ties), "wood", "ties")
m.add(Compound(rails), "dark_steel", "rails")
m.add(Compound(sup), "cast_iron", "bearings")
m.add(Compound(abut), "concrete", "abutments")

m.dim("span", SPAN, "6 節間 × 6.0 m（NIT Srinagar《Truss Bridges》：節間取偶數）")
m.dim("truss_depth", DEPTH, "使斜桿角 50°–60°（同上講義）")
m.dim("diagonal_angle_deg", math.degrees(math.atan2(DEPTH, PANEL)), "同上：50°–60°")
m.dim("track_gauge", 1067, "臺鐵軌距 1067 mm")
m.dim("truss_spacing", B, "估計（單線下承式）")
m.export()
