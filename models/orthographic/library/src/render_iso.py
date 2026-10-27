# -*- coding: utf-8 -*-
"""Blender 等角渲染：blender -b -P render_iso.py -- <out 目錄> [id1,id2,...]
相機＝正交、從右前上方 (+x, -y, +z) 看（和 library.json 的 iso 視圖同方向），
物件前方放一支橘色箭頭指向正面（＝正視方向），Freestyle 畫稜線與輪廓。輸出 <id>-iso.png（透明背景）。"""
import bpy, sys, os, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]
ONLY = set(argv[1].split(',')) if len(argv) > 1 and argv[1] else None
ids = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith('.stl'))
if ONLY:
    ids = [i for i in ids if i in ONLY]


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 24
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.render.resolution_x = 480
    sc.render.resolution_y = 400
    sc.render.resolution_percentage = 100
    sc.render.use_freestyle = True
    sc.render.line_thickness_mode = 'ABSOLUTE'
    sc.render.line_thickness = 1.6
    vl = sc.view_layers[0]
    vl.use_freestyle = True
    fs = vl.freestyle_settings
    fs.crease_angle = math.radians(160)
    ls = fs.linesets[0] if fs.linesets else fs.linesets.new('lines')
    ls.select_by_visibility = True
    ls.visibility = 'VISIBLE'
    ls.select_silhouette = True
    ls.select_border = True
    ls.select_crease = True
    if ls.linestyle is None:
        ls.linestyle = bpy.data.linestyles.new('ls')
    ls.linestyle.color = (0.07, 0.07, 0.2)
    ls.linestyle.thickness = 1.6
    sc.view_settings.view_transform = 'Standard'
    w = bpy.data.worlds.new('w'); sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0.9, 0.92, 0.96, 1)
    bg.inputs[1].default_value = 0.9
    return sc


def mat(name, rgb, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*rgb, 1)
    p.inputs['Roughness'].default_value = 0.55
    if emit:
        p.inputs['Emission Color'].default_value = (*rgb, 1)
        p.inputs['Emission Strength'].default_value = emit
    return m


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


for sid in ids:
    sc = reset()
    bpy.ops.wm.stl_import(filepath=os.path.join(OUT, sid + '.stl'))
    ob = bpy.context.selected_objects[0]
    ob.data.materials.append(mat('body', srgb('#A5B4FC')))
    bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    lo = Vector([min(v[i] for v in bb) for i in range(3)])
    hi = Vector([max(v[i] for v in bb) for i in range(3)])
    ctr = (lo + hi) / 2
    # 正視方向箭頭：在正面前方，指向 +Y
    L = 16.0
    ax, az = ctr.x, lo.z + (hi.z - lo.z) * 0.35
    y_tip = lo.y - 3.0
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=3.4, depth=6, location=(ax, y_tip - 3, az), rotation=(-math.pi / 2, 0, 0))
    cone = bpy.context.active_object
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=1.3, depth=L - 6, location=(ax, y_tip - 6 - (L - 6) / 2, az), rotation=(math.pi / 2, 0, 0))
    shaft = bpy.context.active_object
    am = mat('arrow', srgb('#F97316'), emit=0.6)
    for a in (cone, shaft):
        a.data.materials.append(am)
        a.visible_shadow = False
    # 相機：正交，方向 (1,-1,1)
    t = Vector((1, -1, 1)).normalized()
    cam_d = bpy.data.cameras.new('cam'); cam_d.type = 'ORTHO'
    cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam)
    full_lo = Vector((lo.x, y_tip - L, lo.z)); full_hi = hi
    fctr = (full_lo + full_hi) / 2
    cam.location = fctr + t * 300
    cam.rotation_euler = (-t).to_track_quat('-Z', 'Y').to_euler()
    r = Vector((1, 1, 0)).normalized(); w = t.cross(r)
    pts = [Vector((x, y, z)) for x in (full_lo.x, full_hi.x) for y in (full_lo.y, full_hi.y) for z in (full_lo.z, full_hi.z)]
    us = [(p - fctr).dot(r) for p in pts]; ws = [(p - fctr).dot(w) for p in pts]
    span_u = max(us) - min(us); span_w = max(ws) - min(ws)
    aspect = sc.render.resolution_x / sc.render.resolution_y
    cam_d.ortho_scale = max(span_u, span_w * aspect) * 1.12
    sc.camera = cam
    sun_d = bpy.data.lights.new('sun', 'SUN'); sun_d.energy = 3.2
    sun = bpy.data.objects.new('sun', sun_d); sc.collection.objects.link(sun)
    sun.rotation_euler = Vector((-0.3, 0.9, -1.5)).normalized().to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(OUT, sid + '-iso.png')
    bpy.ops.render.render(write_still=True)
    print('rendered', sid)
