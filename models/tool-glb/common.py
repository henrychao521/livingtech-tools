"""工具 3D 模型共用：build123d 建實體 → 每個零件輸出 STL＋清單（材質、關鍵尺寸）。
之後由 Blender（assemble_glb.py）上材質、合併、Draco 壓縮輸出 glb。
單位：mm。座標：Z 朝上、正面朝 -Y（glb 匯出後即 model-viewer 預設看到的正面）。
"""
import json, os, math
from build123d import *  # noqa

OUT = os.environ.get("TOOLGLB_OUT", "/Volumes/Work/_work/3d-redraw-2026-10-28/parts")


class Model:
    def __init__(self, name, tol=0.05, ang=0.25):
        self.name, self.tol, self.ang = name, tol, ang
        self.parts, self.dims, self.sources = [], {}, {}

    def add(self, shape, mat, label=None, tol=None):
        label = label or f"p{len(self.parts):02d}"
        self.parts.append((label, shape, mat, tol))
        return shape

    def dim(self, key, value, source):
        """記錄關鍵尺寸（mm 或度）與出處，給量測對帳用。"""
        self.dims[key] = round(float(value), 3)
        self.sources[key] = source

    def export(self):
        d = os.path.join(OUT, self.name)
        os.makedirs(d, exist_ok=True)
        for f in os.listdir(d):
            if f.endswith(".stl"):
                os.remove(os.path.join(d, f))
        man = []
        for label, shape, mat, tol in self.parts:
            p = os.path.join(d, f"{label}.stl")
            export_stl(shape, p, tolerance=tol or self.tol, angular_tolerance=self.ang)
            man.append({"label": label, "mat": mat, "stl": p, "volume_mm3": round(shape.volume, 1)})
        bb = Compound([s for _, s, _, _ in self.parts]).bounding_box()
        info = {"name": self.name, "parts": man,
                "bbox_mm": [round(bb.size.X, 2), round(bb.size.Y, 2), round(bb.size.Z, 2)],
                "bbox_min_mm": [round(bb.min.X, 2), round(bb.min.Y, 2), round(bb.min.Z, 2)],
                "dims": self.dims, "sources": self.sources}
        json.dump(info, open(os.path.join(d, "manifest.json"), "w"), ensure_ascii=False, indent=1)
        print("EXPORTED", self.name, info["bbox_mm"], len(man), "parts")
        return info


def poly(pts, plane=Plane.XY):
    """2D 多邊形（mm）轉成面。"""
    return plane * make_face(Polyline(*pts, close=True))


def slab(pts, t, plane=Plane.XY, both=True):
    """把 2D 輪廓擠出成厚 t 的板（預設對稱於平面）。"""
    f = poly(pts, plane)
    return extrude(f, amount=t / 2, both=True) if both else extrude(f, amount=t)


def rot2(p, a_deg, c=(0, 0)):
    a = math.radians(a_deg)
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))


def safe_fillet(shape, edges, r):
    try:
        return fillet(edges, r)
    except Exception as e:  # 圓角失敗就保留原形，並記錄
        print("  fillet skipped:", r, type(e).__name__)
        return shape
