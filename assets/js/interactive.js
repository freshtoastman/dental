/* DrYehDental 2.0 — interactive.js
   療程頁互動模組：all-on-4 自我評估 / mini 比較 / sedation 光譜與清單 / digital 模擬器 / perio 囊袋尺 */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 共用：勾選清單計數 ---------- */
  function countChecked(root) { return $$('input[type=checkbox]', root).filter(function (c) { return c.checked; }).length; }

  /* ---------- All-on-4：自我評估 ---------- */
  function initQuiz(iw) {
    var form = $('[data-quiz]', iw), res = $('[data-quiz-result]', iw); if (!form || !res) return;
    var hint = $('[data-quiz-hint]', form);
    var R = {
      A: { t: '值得評估 All-on-4 全口重建', x: '缺牙範圍大、現有假牙已無法穩定使用——這正是 All-on-4 設計要解決的情況。下一步是 CBCT 與牙周評估，確認骨況與可保留的牙。' },
      B: { t: '多半以局部植牙或保留自然牙為主', x: '缺牙範圍不大時，通常不需要整排重建。先評估缺牙區的骨量與牙周，多數情況局部植牙或牙周治療就能解決。' },
      C: { t: '先做完整牙周檢查，再決定重建方式', x: '牙周狀況會直接影響植體能不能穩定。順序不能反：先控制牙周、確認哪些牙留得住，重建方案才有意義——有些人檢查後根本不需要全口重建。' }
    };
    var NOTES = {
      time: '你在意療程時間：All-on-4 多數情況手術當日就裝上固定式臨時牙，不需經歷無牙期。',
      fear: '你害怕手術：可搭配麻醉科醫師執行的 TCI 舒眠麻醉，多數患者的感受是「睡一覺起來就完成了」。',
      cost: '你在意費用：費用依骨況與材質差異大，我們不做電話報價，檢查後會提供完整計畫書與明細讓你帶回家考慮。',
      chew: '你在意咀嚼：固定式假牙不會移動、不壓迫牙齦，咬合力接近自然牙。',
      q5: '有糖尿病、重度抽菸或放療史：不代表不能做，但需要先控制，因為這些會影響植體與骨頭的癒合。'
    };
    function answers() { var a = {}; ['q1', 'q2', 'q3', 'q4', 'q5'].forEach(function (q) { var el = form.querySelector('input[name=' + q + ']:checked'); a[q] = el ? el.value : null; }); return a; }
    function decide(a) {
      if ((a.q1 === 'b' || a.q1 === 'c') && (a.q2 === 'c' || a.q3 === 'c' || a.q1 === 'c')) return 'A';
      if (a.q1 === 'a') return 'B';
      return 'C';
    }
    $('[data-quiz-submit]', form).addEventListener('click', function () {
      var a = answers();
      if (Object.keys(a).some(function (k) { return !a[k]; })) { hint.hidden = false; return; }
      hint.hidden = true;
      var key = decide(a);
      $('[data-result-title]', res).textContent = R[key].t;
      $('[data-result-text]', res).textContent = R[key].x;
      var ul = $('[data-result-notes]', res); ul.innerHTML = '';
      [NOTES[a.q4], a.q5 === 'b' ? NOTES.q5 : null].filter(Boolean).forEach(function (n) { var li = document.createElement('li'); li.textContent = n; ul.appendChild(li); });
      form.hidden = true; res.hidden = false;
      res.setAttribute('data-summary', '【自我評估】' + R[key].t + '｜缺牙:' + a.q1 + ' 假牙:' + a.q2 + ' 牙周:' + a.q3 + ' 在意:' + a.q4 + ' 全身:' + a.q5);
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('[data-quiz-reset]', res).addEventListener('click', function () { form.reset(); res.hidden = true; form.hidden = false; });
    var copy = $('[data-copy]', res);
    copy.addEventListener('click', function () {
      var text = res.getAttribute('data-summary') + '\n' + $('[data-result-text]', res).textContent;
      var done = function () { copy.textContent = '已複製，貼到 LINE 對話即可'; };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    });
  }

  /* ---------- 微創：翻瓣 vs 微創 ---------- */
  function initCmp(iw) {
    var cmp = $('[data-cmp]', iw); if (!cmp) return;
    var btns = $$('[data-cmp-btn]', cmp), dds = $$('.cmp-metrics dd', cmp);
    function set(mode) {
      cmp.classList.toggle('is-mini', mode === 'mini');
      btns.forEach(function (b) { var on = b.getAttribute('data-cmp-btn') === mode; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      dds.forEach(function (dd) { dd.textContent = dd.getAttribute('data-' + mode); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-cmp-btn')); }); });
    set('flap');
    var cond = $('[data-cond]', iw);
    if (cond) {
      var out = $('[data-cond-result]', cond);
      var upd = function () { out.textContent = out.getAttribute('data-r' + countChecked(cond)); };
      cond.addEventListener('change', upd); upd();
    }
  }

  /* ---------- 舒眠：麻醉深度光譜 + 術前清單 ---------- */
  function initScale(iw) {
    var sc = $('[data-scale]', iw);
    if (sc) {
      var stops = $$('[data-stop]', sc), fill = $('.scale-fill', sc);
      function set(btn) {
        stops.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
        $('[data-scale-name]', sc).textContent = btn.getAttribute('data-name');
        $$('[data-scale-f]', sc).forEach(function (dd) { dd.textContent = btn.getAttribute('data-' + dd.getAttribute('data-scale-f')); });
        $('[data-scale-note]', sc).textContent = btn.getAttribute('data-note');
        var i = Number(btn.getAttribute('data-stop')); fill.style.width = (i / (stops.length - 1) * 100) + '%';
      }
      stops.forEach(function (b) { b.addEventListener('click', function () { set(b); }); });
      set($('[data-stop].is-on', sc) || stops[0]);
    }
    var prep = $('[data-prep]', iw);
    if (prep) {
      var total = $$('input[type=checkbox]', prep).length, fillEl = $('[data-prep-fill]', prep), status = $('[data-prep-status]', prep);
      var upd = function () {
        var n = countChecked(prep); fillEl.style.width = (n / total * 100) + '%';
        status.textContent = n === total ? '準備完成。手術當天見。' : '已完成 ' + n + ' / ' + total + ' 項';
      };
      prep.addEventListener('change', upd); upd();
    }
  }

  /* ---------- 數位：規劃模擬器 ---------- */
  function initSim(iw) {
    var sim = $('[data-sim]', iw); if (!sim) return;
    var PX = 10;                       // 10px = 1mm；骨脊 y=110 → 骨底 390 = 28mm
    var TOP = { x: 330, y: 110 };      // 植體頂端（骨脊）基準
    var NERVE = { x: 360, y: 262, r: 22 };  // 神經管中心：骨脊下約 15 mm
    var body = $('[data-sim-body]', sim), dist = $('[data-sim-dist]', sim), read = $('[data-sim-read]', sim), status = $('[data-sim-status]', sim), msg = $('[data-sim-msg]', sim);
    var inputs = {}; $$('[data-sim]', sim).forEach(function (i) { inputs[i.getAttribute('data-sim')] = i; });
    function draw() {
      var L = Number(inputs.len.value) * PX, ang = Number(inputs.ang.value) * Math.PI / 180, pos = Number(inputs.pos.value) * PX;
      var tx = TOP.x + pos, ty = TOP.y, w = 20;
      var dx = Math.sin(ang), dy = Math.cos(ang);
      var tipx = tx + dx * L, tipy = ty + dy * L;
      // 以植體軸為基準畫錐形本體
      var nx = dy, ny = -dx;
      var p = [
        [tx + nx * w, ty + ny * w], [tx - nx * w, ty - ny * w],
        [tipx - nx * (w * .55), tipy - ny * (w * .55)], [tipx + nx * (w * .55), tipy + ny * (w * .55)]
      ];
      body.setAttribute('d', 'M' + p.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' L') + ' Z');
      var d = Math.hypot(tipx - NERVE.x, tipy - NERVE.y) - NERVE.r;
      var mm = Math.max(0, d / PX);
      dist.setAttribute('x1', tipx); dist.setAttribute('y1', tipy);
      var ux = (NERVE.x - tipx), uy = (NERVE.y - tipy), un = Math.hypot(ux, uy) || 1;
      dist.setAttribute('x2', NERVE.x - ux / un * NERVE.r); dist.setAttribute('y2', NERVE.y - uy / un * NERVE.r);
      $('[data-sim-out="len"]', sim).textContent = inputs.len.value + ' mm';
      $('[data-sim-out="ang"]', sim).textContent = inputs.ang.value + '°';
      $('[data-sim-out="pos"]', sim).textContent = (inputs.pos.value > 0 ? '+' : '') + inputs.pos.value + ' mm';
      read.textContent = mm.toFixed(1) + ' mm';
      var state = mm >= 2 ? 'safe' : (mm >= 1 ? 'warn' : 'danger');
      sim.setAttribute('data-state', state);
      status.textContent = state === 'safe' ? '安全距離' : (state === 'warn' ? '警戒' : '侵犯安全區');
      msg.textContent = msg.getAttribute('data-' + state);
    }
    Object.keys(inputs).forEach(function (k) { inputs[k].addEventListener('input', draw); });
    draw();
  }

  /* ---------- 牙周：囊袋深度尺 + 症狀檢查 ---------- */
  function initPocket(iw) {
    var pk = $('[data-pocket]', iw);
    if (pk) {
      var PX = 18; // 1mm = 18px
      var range = $('[data-pk]', pk), out = $('[data-pk-out]', pk);
      var gum = $('[data-pk-gum]', pk), boneR = $('[data-pk-bone-r]', pk), ticks = $('[data-pk-ticks]', pk), dim = $('[data-pk-dim] line', pk), dimT = $('[data-pk-dim-t]', pk);
      var STAGES = [
        { max: 3, s: '健康或牙齦炎', t: '1–3 mm 屬於健康範圍；若有出血，多為牙齦發炎，骨頭尚未受影響。', a: '建議：維持正確刷牙與定期洗牙。' },
        { max: 5, s: '輕度牙周炎', t: '4–5 mm 表示牙齦與牙根之間開始形成囊袋，齒槽骨已有輕微流失。', a: '建議：安排完整牙周檢查與基礎治療，這個階段介入效果最好。' },
        { max: 7, s: '中度牙周炎', t: '6–7 mm 的囊袋清潔不到，細菌持續破壞骨頭，牙齒可能開始鬆動。', a: '建議：需要深部清創（可搭配雷射輔助），並在再評估後決定是否需進一步治療。' },
        { max: 99, s: '重度牙周炎', t: '8 mm 以上骨頭流失明顯，牙齒鬆動或移位；但不是每一顆都保不住。', a: '建議：逐顆評估。在任何拔牙或植牙決定之前，先完成全口牙周檢查。' }
      ];
      function draw() {
        var mm = Number(range.value), d = mm * PX;
        out.textContent = mm + ' mm';
        // 右側牙齦：沿牙面往下形成囊袋，再回到牙齦線
        var gy = 200 + d;
        gum.setAttribute('d', 'M320,200 L320,' + gy + ' Q330,' + (gy + 18) + ' 345,' + (gy + 6) + ' Q400,' + (200 + d * .35) + ' 480,200');
        // 右側骨頭：隨囊袋加深而下降（骨喪失）
        var boneTop = 230 + Math.max(0, mm - 3) * PX; boneR.setAttribute('y', boneTop); boneR.setAttribute('height', 400 - boneTop);
        // 探針刻度
        var t = ''; for (var i = 1; i <= mm; i++) t += '<line x1="326" y1="' + (200 + i * PX) + '" x2="' + (i % 3 === 0 ? 340 : 335) + '" y2="' + (200 + i * PX) + '"/>';
        ticks.innerHTML = t; $('[data-pk-probe] > line', pk).setAttribute('y2', 200 + d);
        dim.setAttribute('y2', 200 + d); dimT.setAttribute('y', 200 + d / 2 + 5); dimT.textContent = mm + ' mm';
        var st = STAGES.filter(function (s) { return mm <= s.max; })[0];
        $('[data-pk-stage]', pk).textContent = st.s; $('[data-pk-text]', pk).textContent = st.t; $('[data-pk-action]', pk).textContent = st.a;
        pk.setAttribute('data-level', STAGES.indexOf(st));
      }
      range.addEventListener('input', draw); draw();
    }
    var sym = $('[data-sym]', iw);
    if (sym) {
      var res = $('[data-sym-result]', sym);
      var upd = function () { var n = countChecked(sym); res.textContent = res.getAttribute(n === 0 ? 'data-r0' : n <= 2 ? 'data-r1' : n <= 4 ? 'data-r3' : 'data-r5'); };
      sym.addEventListener('change', upd); upd();
    }
  }

  var MODULES = { 'all-on-4': initQuiz, 'mini': initCmp, 'sedation': initScale, 'digital': initSim, 'perio': initPocket };
  function init() { $$('[data-iw]').forEach(function (iw) { var fn = MODULES[iw.getAttribute('data-iw')]; if (fn) fn(iw); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
