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
        for label, shape, mat, tol in resolve_overlaps(self.parts):
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


def resolve_overlaps(parts):
    """匯出前消掉貼齊的重疊面（2026-11-07，qa_glb.py 抓到 7 件 z-fighting）：
    1. 同材質零件先聯集成一個實體（內部相接面消失）。
    2. 不同材質互相嵌入時，從體積大的扣掉體積小的（例如錘頭扣掉錘面），兩者只剩背對背的接觸面。
    外框不變：聯集與相減都不會改變整組零件的外輪廓。布林失敗就保留原形並印出來。"""
    groups = {}
    for label, shape, mat, tol in parts:
        g = groups.setdefault(mat, [label, [], mat, tol])
        g[1].append(shape)
        if tol is not None:
            g[3] = tol if g[3] is None else min(g[3], tol)
    merged = []
    for mat, (label, shapes, _, tol) in groups.items():
        # 一個零件也可能是多個互相重疊的實體湊成的 Compound（例如橋的支承），一律拆成實體再聯集
        solids = [so for sh in shapes for so in sh.solids()]
        sh = Compound(solids) if solids else shapes[0]
        if len(solids) > 1:
            try:
                sh = solids[0].fuse(*solids[1:]).clean()
            except Exception as e:
                print("  fuse failed:", mat, type(e).__name__)
        merged.append([mat if len(shapes) > 1 else label, sh, mat, tol])
    for i in range(len(merged)):
        for j in range(len(merged)):
            if i == j:
                continue
            a, b = merged[i], merged[j]
            if a[1].volume <= b[1].volume:
                continue
            try:
                inter = a[1] & b[1]   # .intersect() 回傳 ShapeList，沒有 volume
                v = inter.volume if inter is not None else 0
            except Exception:
                v = 0
            if v > 1e-3:
                try:
                    cut = a[1].cut(b[1])
                    if cut.volume > 0:
                        a[1] = cut
                        print(f"  cut {b[0]}({b[2]}) out of {a[0]}({a[2]}): {v:.1f} mm3")
                except Exception as e:
                    print("  cut failed:", a[0], b[0], type(e).__name__)
    return [tuple(x) for x in merged]


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
