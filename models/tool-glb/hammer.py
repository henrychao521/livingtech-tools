"""羊角錘 16 oz（彎爪）。
尺寸：全長 337 mm（13-1/4"）、錘頭長 133 mm（Stanley 51-616 型錄，16 oz、山胡桃木柄）。
錘面直徑 29 mm、柄截面 32×25 mm 為常見值（估計）。
擺法：柄朝下直立，錘面朝 -X、羊角朝 +X，正面（-Y）看到側輪廓。
"""
import math
from common import *

m = Model("hammer", tol=0.05)
H_ALL = 337.0
HEAD_L = 133.0
H0 = H_ALL - 14.0          # 錘頭中心線高度（錘頭頂面在 H0+14）
X_FACE, X_TIP = -70.0, 63.0  # 錘面端、羊角尖端（總長 133）

# 錘眼本體
eye = Pos(-2, 0, H0) * Box(32, 24, 29)
eye = safe_fillet(eye, eye.edges().filter_by(Axis.Y), 4)
# 頸部（往錘面漸粗）與錘面
neck = Pos(-18, 0, H0) * (Rot(0, -90, 0) * Cone(10.5, 12.5, 40, align=(Align.CENTER, Align.CENTER, Align.MIN)))
face = Pos(X_FACE, 0, H0) * (Rot(0, 90, 0) * Cylinder(14.5, 12, align=(Align.CENTER, Align.CENTER, Align.MIN)))
face = chamfer(face.edges().sort_by(Axis.X)[0], 1.5)

# 羊角：XZ 平面的弧形輪廓（圓心 C、外半徑 RO、內半徑 RI，由 90° 掃到 35°）
C = (10.0, H0 - 46.0); RO, RI = 60.0, 41.0
def arc(r, a0, a1, n=14):
    return [(C[0] + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
             C[1] + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
outer = arc(RO, 90, 34)
inner = arc(RI, 34, 90)
tip = (X_TIP, outer[-1][1] - 6.0)
claw_pts = [(0, H0 + 14.0)] + outer + [tip] + inner + [(0, H0 - 5)]
claw = extrude(Plane.XZ * make_face(Polyline(*[(x, z) for x, z in claw_pts], close=True)), amount=11, both=True)
# 俯視收窄：羊角寬度由 22 mm 收到尖端 12 mm
taper = extrude(make_face(Polyline((0, -11), (X_TIP + 2, -6), (X_TIP + 2, 6), (0, 11), close=True)), amount=400)
claw = claw & Pos(0, 0, -50) * taper
# 拔釘 V 槽：根部 0 → 尖端 5 mm
vslot = extrude(make_face(Polyline((24, 0), (X_TIP + 5, -2.8), (X_TIP + 5, 2.8), close=True)), amount=400)
claw = claw - Pos(0, 0, -50) * vslot

head = eye + neck + face + claw
# 柄孔
eye_hole = Pos(-2, 0, H0) * Box(20, 12, 40)

# 山胡桃木柄：橢圓斷面放樣
secs = [(0, 16.0, 12.5), (20, 16.5, 12.8), (120, 15.5, 12.0), (230, 12.0, 8.8), (H0 - 18, 12.5, 9.0), (H0 + 14.2, 10.0, 6.0)]
handle = loft([Plane.XY.offset(z) * Ellipse(a, b) for z, a, b in secs])
handle = Pos(-2, 0, 0) * handle
head = head - eye_hole + (handle & Pos(-2, 0, H0) * Box(20, 12, 40))  # 錘眼裡的木頭
handle_out = handle - Pos(-2, 0, H0) * Box(40, 40, 40)

m.add(head - (handle & Pos(-2, 0, H0) * Box(20, 12, 40)), "dark_steel", "head")
m.add(face, "steel", "face_polish")
m.add(handle, "wood", "handle")

bb = Compound([head, handle]).bounding_box()
m.dim("overall_length", bb.size.Z, "Stanley 51-616 型錄：全長 13-1/4 in（337 mm）")
m.dim("head_length", bb.size.X, "Stanley 51-616 型錄：錘頭長 133 mm")
m.dim("face_diameter", 29.0, "16 oz 羊角錘常見值（估計）")
m.export()
