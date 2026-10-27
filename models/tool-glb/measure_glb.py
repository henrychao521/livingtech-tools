# 用法：blender -b -P measure_glb.py -- <glb 資料夾> <零件資料夾(manifest)> <輸出.json>
# 量每個 glb 的外框（mm）、三角面數、檔案大小，和規格目標值對帳（容許誤差 2%）。
import bpy, sys, os, json
from mathutils import Vector
args = sys.argv[sys.argv.index("--") + 1:]
gdir, pdir, out = args
# 規格目標：(軸, 目標 mm, 出處)；軸 X/Y/Z 對應 glb 匯入 Blender 後的座標（Z 朝上）
TARGETS = {
 "wrench": [("X", 200.0, "MCC H200 全長 200 mm")],
 "hammer": [("Z", 337.0, "Stanley 51-616 全長 337 mm"), ("X", 133.0, "Stanley 51-616 錘頭長 133 mm")],
 "knife": [],
 "screwdriver": [("X", 205.0, "RS 0170599 全長 205 mm")],
 "pliers": [],
 "breadboard": [("X", 165.1, "BB830 165.1 mm"), ("Y", 54.6, "BB830 54.6 mm"), ("Z", 8.5, "BB830 8.5 mm")],
 "microcontroller": [("Y", 53.34, "UNO 2100 mil")],
 "drill": [("X", 169.0, "DDF485 長 169 mm"), ("Y", 79.0, "DDF485 寬 79 mm"), ("Z", 255.0, "DDF485 高 255 mm")],
 "drillpress": [("Z", 581.7, "WEN 4208T 高 22.9 in")],
 "scrollsaw": [("X", 669.9, "WEN 3921 26-3/8 in"), ("Y", 330.2, "WEN 3921 13 in"), ("Z", 374.7, "WEN 3921 14-3/4 in")],
 "sander": [],
 "printer3d": [("X", 440.0, "Ender-3 440 mm"), ("Y", 440.0, "Ender-3 440 mm"), ("Z", 465.0, "Ender-3 465 mm")],
 "bridge": [("X", 36000.0 + 6600.0, "跨徑 36 m＋兩端支承／橋台（模型值）")],
}
res = {}
for f in sorted(os.listdir(gdir)):
    if not f.endswith(".glb"):
        continue
    name = f[:-4]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.join(gdir, f))
    obs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in obs for c in o.bound_box]
    lo = [min(p[i] for p in pts) for i in range(3)]; hi = [max(p[i] for p in pts) for i in range(3)]
    size = [round((hi[i] - lo[i]) * 1000, 2) for i in range(3)]
    tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in obs)
    mats = sorted({s.material.name for o in obs for s in o.material_slots if s.material})
    man = json.load(open(os.path.join(pdir, name, "manifest.json")))
    checks = []
    for ax, tgt, src in TARGETS.get(name, []):
        v = size["XYZ".index(ax)]
        err = (v - tgt) / tgt * 100
        checks.append({"axis": ax, "measured_mm": v, "target_mm": tgt, "err_pct": round(err, 2), "ok": abs(err) <= 2.0, "source": src})
    res[name] = {"bbox_mm": size, "tris": tris, "bytes": os.path.getsize(os.path.join(gdir, f)),
                 "materials": mats, "checks": checks, "cad_dims": man["dims"], "cad_sources": man["sources"]}
    print("MEASURE", name, size, tris, res[name]["bytes"], [c["ok"] for c in checks])
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
