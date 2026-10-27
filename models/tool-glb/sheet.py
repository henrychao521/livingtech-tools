"""拼圖：python3 sheet.py <模式 views|compare> <輸出.png> <名稱...>
views：每列一個模型的 iso/front/side/top（新模型）
compare：每列 舊 iso｜新 iso｜新 front｜新 top
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
W = "/Volumes/Work/_work/3d-redraw-2026-10-28"
mode, out, names = sys.argv[1], sys.argv[2], sys.argv[3:]
T = 300
FONT = None
for f in ["/System/Library/Fonts/PingFang.ttc", "/System/Library/Fonts/STHeiti Medium.ttc", "/Library/Fonts/Arial Unicode.ttf"]:
    if os.path.exists(f):
        FONT = ImageFont.truetype(f, 20); break
LABEL = {"breadboard": "麵包板", "microcontroller": "Arduino UNO", "drill": "手電鑽", "drillpress": "鑽床",
         "printer3d": "3D 印表機", "sander": "砂帶砂盤機", "scrollsaw": "線鋸機", "bridge": "桁架橋",
         "hammer": "羊角錘", "knife": "美工刀", "wrench": "活動扳手", "pliers": "尖嘴鉗", "screwdriver": "十字起子"}
if mode == "views":
    cols = [("renders_new", v) for v in ("iso", "front", "side", "top")]
    heads = ["新 等角", "新 正面", "新 側面", "新 俯視"]
else:
    cols = [("renders_old", "iso"), ("renders_new", "iso"), ("renders_new", "front"), ("renders_new", "top")]
    heads = ["舊（AI 生成）等角", "新（參數化 CAD）等角", "新 正面", "新 俯視"]
LW = 150
img = Image.new("RGB", (LW + T * 4, 36 + T * len(names)), "white")
d = ImageDraw.Draw(img)
for j, h in enumerate(heads):
    d.text((LW + j * T + 8, 8), h, fill="black", font=FONT)
for i, n in enumerate(names):
    y = 36 + i * T
    d.text((8, y + T // 2 - 12), LABEL.get(n, n), fill="black", font=FONT)
    for j, (folder, v) in enumerate(cols):
        p = os.path.join(W, folder, f"{n}-{v}.png")
        if os.path.exists(p):
            im = Image.open(p).convert("RGB").resize((T, T))
            img.paste(im, (LW + j * T, y))
        d.rectangle([LW + j * T, y, LW + j * T + T - 1, y + T - 1], outline="#bbbbbb")
img.save(out)
print("saved", out, img.size)
