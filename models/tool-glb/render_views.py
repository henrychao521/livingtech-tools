# 用法：blender -b -P render_views.py -- <輸出資料夾> <glb...>
# 每個 glb 算 4 張（等角 iso／正面 front／側面 side／俯視 top），Workbench、正交相機、640px。
# 有貼圖的（舊 AI 模型）用 TEXTURE 著色，沒有貼圖的（新 CAD 模型）用材質顏色。
import bpy, sys, os
from mathutils import Vector
args = sys.argv[sys.argv.index("--") + 1:]
out = args[0]; glbs = args[1:]
os.makedirs(out, exist_ok=True)
VIEWS = {"iso": (1, -1, 0.8), "front": (0, -1, 0), "side": (1, 0, 0), "top": (0, 0, 1)}
for g in glbs:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=g)
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    ctr = (lo + hi) / 2; size = max(hi - lo)
    has_tex = any(n.type == "TEX_IMAGE" for m in bpy.data.materials if m.use_nodes for n in m.node_tree.nodes)
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_WORKBENCH"
    sh = sc.display.shading
    sh.light = "STUDIO"; sh.color_type = "TEXTURE" if has_tex else "MATERIAL"
    sh.show_cavity = True; sh.cavity_type = "BOTH"; sh.show_object_outline = True
    sc.render.resolution_x = sc.render.resolution_y = 640
    sc.world = bpy.data.worlds.new("w"); sc.world.color = (0.93, 0.93, 0.93)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = "ORTHO"
    cam.data.clip_end = size * 20
    name = os.path.splitext(os.path.basename(g))[0]
    for v, d in VIEWS.items():
        dv = Vector(d).normalized()
        cam.data.ortho_scale = size * (1.5 if v == "iso" else 1.12)
        cam.location = ctr + dv * size * 4
        cam.rotation_euler = (0, 0, 0) if v == "top" else (-dv).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = os.path.join(out, f"{name}-{v}.png")
        bpy.ops.render.render(write_still=True)
    tris = sum(len(o.data.polygons) for o in objs)
    print("DIMS", name, tuple(round(x, 4) for x in (hi - lo)), "faces", tris, "objs", len(objs))
