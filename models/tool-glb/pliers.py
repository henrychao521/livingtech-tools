"""尖嘴鉗 150 mm（附剪線刃）。
尺寸：全長 161 mm、先端幅 2.5 mm、先端厚 1.8 mm、頭部厚 10 mm、頭部長 50 mm（MISUMI 型錄 RA-150 細長尖嘴鉗）。
握把套長度與寬度為常見值（估計）。支點為搭接（兩片各半厚）＋鉚釘。
擺法：攤平在 XZ 平面、鉗口朝 +X、張開約 10°。
"""
import math
from common import *

m = Model("pliers", tol=0.03)
TIP_X, X_END = 44.0, -117.0      # 鉗尖、握把尾端（全長 161）
T_HEAD, T_TIP, T_HANDLE = 10.0, 1.8, 8.0
R_JOINT = 10.0
OPEN = 5.0                        # 每片轉 5°（總張角 10°）

def half(sign):
    """sign=+1：上鉗口＋下握把；sign=-1 鏡像。"""
    s = sign
    jaw = [(0, 0), (TIP_X, 0), (TIP_X, s * 1.25), (30, s * 2.4), (16, s * 4.6), (6, s * 8.2), (-2, s * 9.6)]
    jaw2d = make_face(Polyline(*[(x, z) for x, z in jaw], close=True))
    disk = Circle(R_JOINT)
    # 握把中心線往另一側（-s）彎
    hc = [(-4, -s * 3.0), (-30, -s * 9.5), (-70, -s * 14.0), (X_END + 6, -s * 17.0)]
    handle2d = trace(Polyline(*hc), line_width=9.0)
    prof = jaw2d + disk + handle2d
    solid = extrude(Plane.XZ * prof, amount=T_HEAD / 2, both=True)
    # 厚度：鉗口由 10 收到 1.8；握把 8
    thick = make_face(Polyline((-200, -T_HANDLE / 2), (-14, -T_HANDLE / 2), (-8, -T_HEAD / 2), (8, -T_HEAD / 2),
                               (TIP_X + 1, -T_TIP / 2), (TIP_X + 1, T_TIP / 2), (8, T_HEAD / 2), (-8, T_HEAD / 2),
                               (-14, T_HANDLE / 2), (-200, T_HANDLE / 2), close=True))
    solid = solid & Pos(0, 0, -100) * extrude(thick, amount=200)
    # 搭接：支點圓內，上片留 y≥0、下片留 y≤0
    lap = (Rot(90, 0, 0) * Cylinder(R_JOINT + 0.6, T_HEAD + 2)) & Pos(0, -s * T_HEAD / 4, 0) * Box(40, T_HEAD / 2 + 0.01, 40)
    solid = solid - lap
    # 剪線刃：鉗口根部菱形缺口
    cut = Plane.XZ * make_face(Polyline((9, 0), (14, s * 1.8), (19, 0), close=True))
    solid = solid - extrude(cut, amount=20, both=True)
    # 鉗口內側鋸齒（細溝）
    for i in range(8):
        x = 22 + i * 2.6
        solid = solid - Pos(x, 0, 0) * Box(0.8, 12, 0.7)
    # 握把套（塑膠）
    grip_c = [(-34, -s * 10.3), (-70, -s * 14.0), (X_END + 6, -s * 17.0)]
    grip2d = trace(Polyline(*grip_c), line_width=14.0) + Pos(X_END + 6, -s * 17.0) * Circle(7.0)
    grip = extrude(Plane.XZ * grip2d, amount=6.5, both=True)
    grip = safe_fillet(grip, grip.edges().filter_by(Axis.Y, reverse=True), 2.5)
    rot = Rot(0, -s * OPEN, 0)   # 繞 Y 軸張開
    return rot * solid, rot * grip

a, ga = half(+1)
b, gb = half(-1)
rivet = Rot(90, 0, 0) * Cylinder(4.2, T_HEAD + 0.8)
rivet = safe_fillet(rivet, rivet.edges(), 0.5)

m.add(a + b, "steel", "jaws")
m.add(rivet, "chrome", "rivet")
m.add(ga + gb, "red_handle", "grips")

bb = Compound([a, b, ga, gb]).bounding_box()
m.dim("overall_length_open10deg", bb.size.X, "MISUMI RA-150：全長 161 mm（閉合時）")
m.dim("tip_width", 2 * 1.25, "MISUMI RA-150：先端部幅 2.5 mm")
m.dim("tip_thickness", T_TIP, "MISUMI RA-150：先端部厚 1.8 mm")
m.dim("head_thickness", T_HEAD, "MISUMI RA-150：頭部厚 10 mm")
m.dim("head_length", TIP_X + R_JOINT - 4, "MISUMI RA-150：頭部長 50 mm")
m.export()
