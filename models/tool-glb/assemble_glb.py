# 用法：blender -b -P assemble_glb.py -- <零件資料夾(含 manifest.json)> <輸出.glb>
# 讀 build123d 輸出的 STL，上 PBR 材質、依角度平滑、同材質合併、Draco 壓縮輸出 glb（Y 朝上、單位公尺）。
import bpy, bmesh, sys, os, json, math
args = sys.argv[sys.argv.index("--") + 1:]
src, out = args[0], args[1]
man = json.load(open(os.path.join(src, "manifest.json")))

# 材質表：(基本色 sRGB, metallic, roughness)
MATS = {
    "steel":       ((0.80, 0.81, 0.82), 1.0, 0.30),
    "chrome":      ((0.92, 0.92, 0.94), 1.0, 0.12),
    "dark_steel":  ((0.16, 0.16, 0.17), 0.85, 0.45),
    "aluminum":    ((0.84, 0.85, 0.87), 1.0, 0.38),
    "black_alu":   ((0.10, 0.10, 0.11), 0.6, 0.45),
    "brass":       ((0.85, 0.68, 0.35), 1.0, 0.30),
    "blade":       ((0.86, 0.87, 0.88), 1.0, 0.18),
    "rubber":      ((0.06, 0.06, 0.06), 0.0, 0.85),
    "black_plastic": ((0.09, 0.09, 0.10), 0.0, 0.55),
    "gray_plastic":  ((0.42, 0.44, 0.47), 0.0, 0.55),
    "white_plastic": ((0.93, 0.93, 0.90), 0.0, 0.55),
    "yellow_plastic": ((0.96, 0.74, 0.08), 0.0, 0.45),
    "red_plastic":   ((0.78, 0.10, 0.08), 0.0, 0.45),
    "red_handle":    ((0.80, 0.12, 0.10), 0.0, 0.40),
    "clear_amber":   ((0.95, 0.55, 0.12), 0.0, 0.25),
    "teal_body":     ((0.02, 0.46, 0.52), 0.0, 0.45),
    "blue_handle":   ((0.10, 0.30, 0.70), 0.0, 0.40),
    "wood":          ((0.74, 0.54, 0.32), 0.0, 0.60),
    "pcb_teal":      ((0.00, 0.50, 0.55), 0.0, 0.50),
    "ic_black":      ((0.07, 0.07, 0.08), 0.0, 0.40),
    "hole_dark":     ((0.04, 0.04, 0.04), 0.0, 0.90),
    "rail_red":      ((0.85, 0.12, 0.12), 0.0, 0.50),
    "rail_blue":     ((0.10, 0.30, 0.85), 0.0, 0.50),
    "machine_green": ((0.30, 0.42, 0.38), 0.2, 0.45),
    "machine_gray":  ((0.55, 0.57, 0.60), 0.3, 0.45),
    "machine_orange": ((0.92, 0.45, 0.10), 0.1, 0.45),
    "cast_iron":     ((0.30, 0.31, 0.32), 0.6, 0.55),
    "sandpaper":     ((0.55, 0.40, 0.25), 0.0, 0.95),
    "bridge_steel":  ((0.42, 0.48, 0.55), 0.5, 0.50),
    "concrete":      ((0.62, 0.62, 0.60), 0.0, 0.90),
    "silver_label":  ((0.75, 0.76, 0.78), 0.8, 0.35),
    "led_green":     ((0.10, 0.85, 0.30), 0.0, 0.30),
    "glass_blue":    ((0.20, 0.35, 0.55), 0.0, 0.10),
    "copper":        ((0.85, 0.50, 0.30), 1.0, 0.35),
    "pla_orange":    ((0.95, 0.50, 0.15), 0.0, 0.40),
    "pla_white":     ((0.90, 0.90, 0.88), 0.0, 0.50),
}

def srgb_to_lin(c):
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

bpy.ops.wm.read_factory_settings(use_empty=True)
mats = {}
def get_mat(key):
    if key in mats:
        return mats[key]
    col, metal, rough = MATS[key]
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*srgb_to_lin(col), 1)
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    m.diffuse_color = (*srgb_to_lin(col), 1)  # Workbench 預覽用
    mats[key] = m
    return m

by_mat = {}
for p in man["parts"]:
    bpy.ops.wm.stl_import(filepath=p["stl"], global_scale=0.001)
    ob = bpy.context.selected_objects[0]
    ob.name = p["label"]
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bm.to_mesh(ob.data); bm.free()
    ob.data.materials.clear(); ob.data.materials.append(get_mat(p["mat"]))
    by_mat.setdefault(p["mat"], []).append(ob)

final = []
for key, obs in by_mat.items():
    bpy.ops.object.select_all(action="DESELECT")
    for o in obs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    if len(obs) > 1:
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = f"{man['name']}_{key}"
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    final.append(ob)

tris = sum(sum(len(f.vertices) - 2 for f in o.data.polygons) for o in final)
print("TRIS", man["name"], tris)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", use_selection=False, export_apply=True,
                          export_yup=True, export_materials="EXPORT",
                          export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
                          export_draco_position_quantization=14, export_draco_normal_quantization=10,
                          export_draco_texcoord_quantization=10, export_texcoords=False)
print("GLB", out, os.path.getsize(out))
