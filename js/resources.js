// 共用：延伸學習資源（影片 / 可操作工具）自動注入
// 與 sources.js 的差異：
//   sources.js  = 「我們的知識依據」（標準、官方文件、課綱）— 給教師與審查者看
//   resources.js = 「給學生的延伸」（影片、別人做的互動工具）— 給學生課後探索用
//
// 授權原則（重要）：本區塊一律**只放外部連結**，不嵌入、不重製、不改作他人內容。
// 每筆資源皆於 2026-07-28 實際驗證連結存在（YouTube 以 oEmbed、網站以 HTTP 200）。
// lic 欄位標示該資源自身的授權，方便日後判斷可否進一步利用。

window.RESOURCES = {
  mechatronics: {
    videos: [
      { id: '4Y7zG48uHRo', ch: 'MIT AerospaceControlsLab', t: 'Controlling Self Driving Cars',
        len: '4:40', lang: '英語（可開自動翻譯字幕）',
        why: '四分鐘講完 P、I、D 三個增益各自如何影響「車輛」的行為——載體和我們的模擬器完全一樣。看完再回來調 Kp/Kd 會更有感覺。' },
      { id: 'IWgLvKml4h4', ch: 'eirzarog', t: 'Line Following Robot：Bang-Bang / P / PD / PID 實測比較',
        len: '2:51', lang: '英語（畫面為主，幾乎不需語言）',
        why: '同一台車、五種賽道、四種控制律分割畫面同時跑，還有完成秒數計分板。這幾乎就是我們模組的實體版。' },
      { id: 'fusr9eTceEo', ch: 'Gregory L. Holst', t: 'Hardware Demo of a Digital PID Controller',
        len: '2:57', lang: '無字幕（幾乎不需語言）',
        why: '真實馬達的示範。特別注意他做了 anti-windup，因為「真實系統的馬達很容易飽和」——正好對應我們模擬器裡的轉速上限。' },
      { id: 'wkfEZmsQqiA', ch: 'MATLAB', t: 'What Is PID Control?（Understanding PID Control, Part 1）',
        len: '11:42', lang: '英語＋<strong>官方簡體中文字幕</strong>',
        why: '想更深入理解 PID 的第一選擇，刻意跳過數學先建立直覺。全系列共 7 集。' },
      { id: 'PVyAcgYkzDs', ch: 'S D Robotics', t: 'Motor Driver in depth：L293D / L298N / TB6612FNG / VNH2SP30',
        len: '12:50', lang: '英語（可開自動翻譯字幕）',
        why: '四款馬達驅動器橫向比較，對應「馬達選用」模組。看完就知道為什麼不能把馬達直接接在控制板腳位上。' },
      { id: 'Fb27A_Onpbs', ch: 'Simply Put', t: 'Common Ground（共地）實體示範',
        len: '6:28', lang: '英語（可開自動翻譯字幕）',
        why: '用實體電路示範「不共地會發生什麼事」。這是整車除錯裡最難查、最常被忽略的一項。' },
      { id: '6F1B_N6LuKw', ch: 'DroneBot Workshop', t: 'Using the HC-SR04：Everything you need to know',
        len: '48:03', lang: '英語（可開自動翻譯字幕）',
        why: '超音波感測器最完整的一支，含精度改善方法。想做專題可以當工具書慢慢看。' },
      { id: 'n-gJ00GTsNg', ch: 'Science Buddies', t: 'HC-SR04 超音波感測器與 Arduino（Lesson #9）',
        len: '5:28', lang: '英語（可開自動翻譯字幕）',
        why: '教育機構出品的課堂版本，五分半講完重點，比上一支好入門。' },
      { id: 'LuX_ZGIRCzo', ch: 'DIY Machines', t: 'TCRT5000 紅外線反射感測器的原理與實測',
        len: '3:40', lang: '英語（可開自動翻譯字幕）',
        why: '直接對應「循跡感測與二值化」模組，會看到真實讀值如何隨表面與距離改變。' },
      { id: 'XG4cODYVbJk', ch: 'Duckietown', t: 'Modeling of a Differential Drive Robot（差速驅動運動學）',
        len: '7:02', lang: '英語（可開自動翻譯字幕）',
        why: '我們模擬器背後的數學。想知道「左右輪速度怎麼變成車子的位置與方向」就看這支。' },
    ],
    tools: [
      { url: 'https://gears.aposteriori.com.sg/', name: 'Gears（GearsBot）', lic: 'GPL-3.0・開源',
        why: '3D 物理模擬的循跡機器人，預設就是單感測器循跡車。可用 Blockly 積木或 Python 寫程式——是從「調參數」畢業到「自己寫控制程式」的下一步。' },
      { url: 'https://grauonline.de/alexwww/ardumower/pid/pid.html', name: 'Ardumower PID 模擬器', lic: '未標示授權',
        why: '純網頁的 PID 調校器，是 Arduino PID Library 的移植。我們的模擬器教「PD 用在車上」，這個教「PID 演算法本身」。' },
      { url: 'https://www.falstad.com/circuit/circuitjs.html', name: 'Falstad 電路模擬器', lic: '開源',
        why: '共地、H 橋、PWM 這些主題在控制層是看不見的，必須下到電路層。電流會以流動的小圓點呈現，非常直觀。' },
      { url: 'https://makecode.microbit.org/', name: 'micro:bit MakeCode', lic: 'MIT（部分）',
        why: '內建模擬器，寫完程式不用實體板子也能先看結果。' },
    ],
  },

  'emerging-tech': {
    videos: [
      { id: '1XGFkkkJhSw', ch: '數位發展部 moda', t: '1-2. AI 如何運作？｜你的第一堂 AI 課',
        len: '6:38', lang: '<strong>繁體中文</strong>',
        why: '唐鳳主講，用「預訓練＝先讀完圖書館、微調＝再上專業課」的比喻講清楚 AI 怎麼學會。中文圈少見把原理講對又講白的一支。' },
      { id: 'D2ibL6z_Cns', ch: 'PanSci 泛科學', t: 'AI 的想法已脫離人類掌控？「可解釋 AI」是什麼？',
        len: '13:35', lang: '<strong>繁體中文字幕</strong>',
        why: '直接呼應「AI 影像辨識」模組：為什麼 AI 會給出你無法理解的答案，以及我們憑什麼相信它。' },
      { id: 'LPZh9BOjkQs', ch: '3Blue1Brown', t: 'Large Language Models explained briefly',
        len: '7:58', lang: '英語＋中文人工字幕',
        why: '視覺化說明的天花板。八分鐘不到講完大型語言模型在做什麼。' },
      { id: 'UG_X_7g63rY', ch: 'TED（Joy Buolamwini）', t: 'How I\'m fighting bias in algorithms',
        len: '8:44', lang: '英語＋<strong>繁體中文字幕</strong>',
        why: '演算法偏誤最好的入口：她發現人臉辨識偵測不到自己的臉，戴上白面具才被認出來。比任何統計數字都有說服力。' },
      { id: 'KZVgKu6v808', ch: 'engineerguy', t: 'How a Smartphone Knows Up from Down（加速度計原理）',
        len: '4:24', lang: '英語（可開自動翻譯字幕）',
        why: '對應「穿戴式裝置」模組。用實體放大模型解釋手機/手錶裡的感測器怎麼知道你在動。' },
    ],
    tools: [
      { url: 'https://teachablemachine.withgoogle.com/', name: 'Teachable Machine（Google）', lic: '網站服務為 Google 專有',
        why: '用自己的鏡頭在三十秒內訓練一個影像分類器，當場看到信心分數隨姿勢改變。做完我們的 M1 之後最該去玩的一個。' },
      { url: 'https://pair.withgoogle.com/explorables/', name: 'Google PAIR AI Explorables', lic: 'Apache-2.0・開源',
        why: '其中「Measuring Fairness」有和我們 M2 一樣的門檻滑桿，示範為什麼各種「公平」的定義在數學上無法同時滿足。' },
      { url: 'https://poloclub.github.io/cnn-explainer/', name: 'CNN Explainer', lic: 'MIT・開源',
        why: '把影像辨識模型一層一層拆開來看，可以上傳自己的圖片，看它到底在「看」什麼。' },
      { url: 'https://playground.tensorflow.org/', name: 'TensorFlow Playground', lic: 'Apache-2.0・開源',
        why: '不用寫程式，拉滑桿就能訓練一個神經網路，即時看到它怎麼學會分類。' },
      { url: 'https://audreyt.github.io/polygons/', name: '別讓圖形不開心（唐鳳譯）', lic: 'CC0・公有領域',
        why: '互動小遊戲：每個人只有一點點偏好，整體卻導向嚴重隔離。理解演算法偏誤與社會後果最好的入門。' },
      { url: 'https://machinelearningforkids.co.uk/', name: 'Machine Learning for Kids', lic: 'Apache-2.0・有繁中介面',
        why: '訓練自己的模型並接到 Scratch 做出小專題，適合想動手做的同學。' },
    ],
  },

  steam: {
    videos: [
      { id: 'LPZh9BOjkQs', ch: '3Blue1Brown', t: 'Large Language Models explained briefly',
        len: '7:58', lang: '英語＋中文人工字幕',
        why: '看完「二進位與編碼」後的延伸：這些 0 和 1 最後怎麼變成會講話的 AI。' },
      { id: 'KZVgKu6v808', ch: 'engineerguy', t: 'How a Smartphone Knows Up from Down',
        len: '4:24', lang: '英語（可開自動翻譯字幕）',
        why: '科學原理如何變成日常科技產品的經典示範，也是「一支影片只講一個東西」的最佳範本。' },
    ],
    tools: [
      { url: 'https://musiclab.chromeexperiments.com/Harmonics/', name: 'Chrome Music Lab：Harmonics', lic: 'Apache-2.0・開源',
        why: '對應「聲音的科學」：親手疊加諧波，同時聽見與看見音色如何改變。同站的 Spectrogram 可以看見你自己聲音的頻譜。' },
      { url: 'https://algorithm-visualizer.org/', name: 'Algorithm Visualizer', lic: 'MIT・開源',
        why: '對應「排序演算法」：動畫跑到哪一步，旁邊的程式碼就高亮哪一行。從「看懂動畫」升級到「看懂程式」。' },
      { url: 'https://phet.colorado.edu/zh_TW/simulations/geometric-optics', name: 'PhET 幾何光學（繁體中文）', lic: 'CC BY-NC・教育用途免費',
        why: '對應「光與透鏡成像」：可換凹透鏡與面鏡，看更多種成像情況。有正體中文版。' },
      { url: 'https://www.csunplugged.org/', name: 'CS Unplugged', lic: 'CC BY-SA 4.0・開源',
        why: '對應「二進位」與「排序」：一整套不用電腦就能玩的運算思維活動，含著名的同位檢查紙牌魔術。' },
      { url: 'https://www.falstad.com/circuit/circuitjs.html', name: 'Falstad 電路／波動模擬器', lic: '開源',
        why: '同站另有波動與光學的模擬，可搭配聲音與透鏡單元一起看。' },
    ],
  },
};

// ---------- 渲染 ----------
function _renderResourcesBlock(toolId) {
  const lib = window.RESOURCES[toolId];
  if (!lib) return null;
  const vids = lib.videos || [], tools = lib.tools || [];
  if (!vids.length && !tools.length) return null;

  const section = document.createElement('section');
  section.className = 'resources-section';
  section.style.cssText = 'background:#FFFBEB;border:1px solid #FDE68A;padding:26px 22px;margin:36px auto 0;border-radius:14px;max-width:1200px';

  const vidHtml = vids.map(v => `
    <li style="margin-bottom:14px;display:flex;gap:12px;align-items:flex-start">
      <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener"
         style="flex:0 0 132px;display:block;border-radius:8px;overflow:hidden;background:#0f172a">
        <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy"
             style="width:132px;height:74px;object-fit:cover;display:block">
      </a>
      <div style="flex:1;min-width:0">
        <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener"
           style="font-weight:700;font-size:14px;color:#92400E;text-decoration:none;line-height:1.5">${v.t} ↗</a>
        <div style="font-size:12px;color:#A16207;margin:3px 0">${v.ch}　·　${v.len}　·　${v.lang}</div>
        <div style="font-size:13px;color:#78350F;line-height:1.65">${v.why}</div>
      </div>
    </li>`).join('');

  const toolHtml = tools.map(t => `
    <li style="margin-bottom:11px">
      <a href="${t.url}" target="_blank" rel="noopener"
         style="font-weight:700;font-size:14px;color:#92400E;text-decoration:none">${t.name} ↗</a>
      <span style="font-size:11px;background:#FEF3C7;color:#A16207;padding:2px 7px;border-radius:4px;margin-left:6px">${t.lic}</span>
      <div style="font-size:13px;color:#78350F;line-height:1.65;margin-top:2px">${t.why}</div>
    </li>`).join('');

  section.innerHTML = `
    <details open>
      <summary style="cursor:pointer;font-size:16px;font-weight:800;color:#92400E;list-style:none">
        🎒 延伸學習（${vids.length} 支影片・${tools.length} 個可玩的工具）
      </summary>
      ${vids.length ? `<h4 style="font-size:14px;color:#92400E;margin:16px 0 10px">📺 推薦影片</h4>
        <ul style="list-style:none;padding:0;margin:0">${vidHtml}</ul>` : ''}
      ${tools.length ? `<h4 style="font-size:14px;color:#92400E;margin:18px 0 10px">🕹️ 動手玩玩看</h4>
        <ul style="list-style:none;padding:0;margin:0">${toolHtml}</ul>` : ''}
      <p style="margin-top:16px;font-size:11.5px;color:#A16207;line-height:1.7;border-top:1px solid #FDE68A;padding-top:12px">
        以上皆為<strong>外部資源連結</strong>，著作權屬各原作者所有，本平台未收錄或改作其內容。
        連結於 2026-07-28 驗證有效；若發現失效或有更好的資源，歡迎
        <a href="https://github.com/henrychao521/livingtech-tools/issues" target="_blank" rel="noopener" style="color:#B45309">回報</a>。
      </p>
    </details>
  `;
  return section;
}

// 自動掛載：接在 sources-section 之前
document.addEventListener('DOMContentLoaded', () => {
  const toolId = document.body.dataset.tool;
  if (!toolId) return;
  if (document.querySelector('.resources-section')) return;
  const section = _renderResourcesBlock(toolId);
  if (!section) return;
  const main = document.querySelector('main');
  if (main) main.appendChild(section);
  else document.body.appendChild(section);
});
