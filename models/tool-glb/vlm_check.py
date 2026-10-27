"""本機 VLM 初篩（Qwen3-VL-4B，mlx-vlm）：每個模型把 等角＋正面 拼成一張，逐項問預期特徵。
用法：~/vlm-venv/bin/python vlm_check.py <renders 資料夾> <輸出 jsonl> [名稱...]
結果只當初篩，報警的項目再由人工確認。
"""
import sys, os, json
from PIL import Image
from mlx_vlm import load, generate
from mlx_vlm.prompt_utils import apply_chat_template

EXPECT = {
 "hammer": ("claw hammer", ["a flat round striking face on one end of the head", "a curved claw with a V-shaped nail slot on the other end", "a long wooden handle"]),
 "knife": ("snap-off utility knife (box cutter)", ["a long plastic body", "a metal blade sticking out of the front end", "a slider button on top of the body"]),
 "wrench": ("adjustable wrench", ["a fixed jaw and a movable jaw forming an open jaw", "a worm screw (knurled adjusting wheel) in the head", "jaws angled about 15 degrees to the handle", "a long flat handle with a hanging hole"]),
 "pliers": ("needle-nose pliers", ["two long thin tapering jaws", "a pivot rivet where the two halves cross", "two handles with plastic grips"]),
 "screwdriver": ("Phillips screwdriver", ["a round handle", "a thin round steel shaft", "a pointed cross-shaped tip"]),
 "breadboard": ("solderless breadboard", ["a white rectangular plastic board", "many small holes in a grid", "a center groove along the length", "red and blue power rail lines"]),
 "microcontroller": ("Arduino UNO board", ["a teal circuit board", "a USB-B connector on one short edge", "black female pin header strips along the long edges", "a long 28-pin DIP chip"]),
 "drill": ("cordless drill driver", ["a pistol-shaped body with a handle", "a battery pack at the bottom of the handle", "a chuck at the front", "a trigger"]),
 "drillpress": ("benchtop drill press", ["a heavy base", "a vertical round column", "a head with a chuck pointing down", "a work table on the column", "feed handles (spokes) on the side"]),
 "scrollsaw": ("scroll saw", ["a C-shaped frame with an upper arm", "a flat table", "a thin vertical blade between the arm and the table", "a base"]),
 "sander": ("belt and disc sander", ["a horizontal abrasive belt around two rollers", "a round sanding disc on the side", "a small work table in front of the disc", "a base"]),
 "printer3d": ("FDM 3D printer (Ender-3 style)", ["a black aluminum extrusion frame with two uprights and a top bar", "a horizontal X gantry with a print head", "a square heated bed", "a filament tube from an extruder to the print head"]),
 "bridge": ("Pratt through truss railway bridge", ["top and bottom chords", "vertical posts and diagonal members", "inclined end posts", "rails or deck between the two trusses", "supports on abutments"]),
}

src, out = sys.argv[1], sys.argv[2]
names = sys.argv[3:] or list(EXPECT)
mp = os.path.expanduser("~/.cache/huggingface/hub/models--mlx-community--Qwen3-VL-4B-Instruct-4bit")
snap = os.path.join(mp, "snapshots", os.listdir(os.path.join(mp, "snapshots"))[0])
model, proc = load(snap)
fo = open(out, "w")
for n in names:
    a = Image.open(os.path.join(src, f"{n}-iso.png")).convert("RGB")
    b = Image.open(os.path.join(src, f"{n}-front.png")).convert("RGB")
    im = Image.new("RGB", (a.width + b.width, a.height), "white"); im.paste(a, (0, 0)); im.paste(b, (a.width, 0))
    tmp = os.path.join(os.path.dirname(out), f"_pair_{n}.png"); im.save(tmp)
    obj, feats = EXPECT[n]
    q = (f"This image shows a 3D model rendered from two angles (left: isometric, right: front). It should be a {obj}.\n"
         "For each feature below answer yes or no, judging only what is visible. Then say whether anything looks clearly wrong for a real "
         f"{obj}. Reply as JSON: {{\"features\": [{{\"feature\": str, \"visible\": \"yes\"|\"no\"}}], \"identified_as\": str, \"problems\": [str]}}.\nFeatures:\n"
         + "\n".join(f"- {f}" for f in feats))
    prompt = apply_chat_template(proc, model.config, q, num_images=1)
    r = generate(model, proc, prompt, image=[tmp], max_tokens=400, temperature=0.0, verbose=False)
    text = getattr(r, "text", r)
    rec = {"name": n, "raw": text}
    try:
        s = text[text.index("{"): text.rindex("}") + 1]; rec["parsed"] = json.loads(s)
    except Exception:
        pass
    fo.write(json.dumps(rec, ensure_ascii=False) + "\n"); fo.flush()
    print(n, "->", (rec.get("parsed") or {}).get("identified_as"), [f["visible"] for f in (rec.get("parsed") or {}).get("features", [])])
