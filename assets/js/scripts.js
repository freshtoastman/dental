/* DrYehDental 2.0 — scripts.js
   模組：門診資料 → 今日門診 / 表格高亮 / 行動版固定列；直排姓名；資歷分隔；選單；摘要截斷；跨頁錨點 */
(function () {
  'use strict';
  var dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  /* ---------- 門診資料（由 partials/schedule.hbs 輸出的 JSON） ---------- */
  function readSchedule() {
    var el = document.getElementById('schedData');
    if (!el) return null;
    try {
      // repeater 缺欄位時 jsonify 會輸出 undefined，這裡容錯
      return JSON.parse(el.textContent.replace(/:undefined/g, ':""'));
    } catch (e) { return null; }
  }

  function slotsFor(data, d) {
    return (data.slots || []).filter(function (s) { return String(s.d) === String(d) && s.c; })
      .sort(function (a, b) { return Number(a.s) - Number(b.s); });
  }

  function slotTime(data, s) {
    return s.t || (data.sessions && data.sessions[s.s]) || '';
  }

  /* 把同一天同一診所的連續時段合併成「西區診所 14:00–21:00」 */
  function summarize(data, slots) {
    var groups = [];
    slots.forEach(function (s) {
      var last = groups[groups.length - 1];
      if (last && last.c === s.c) { last.times.push(slotTime(data, s)); }
      else { groups.push({ c: s.c, times: [slotTime(data, s)] }); }
    });
    return groups.map(function (g) {
      var first = g.times[0], lastT = g.times[g.times.length - 1];
      var start = (first.split(/[–\-~]/)[0] || '').trim();
      var end = (lastT.split(/[–\-~]/).pop() || '').trim();
      return { c: g.c, t: start && end ? start + '–' + end : g.times.join('、') };
    });
  }

  function initToday() {
    var data = readSchedule();
    var box = document.getElementById('today');
    var fab = document.getElementById('fabToday');
    if (!data) return;
    var d = new Date().getDay();
    var today = summarize(data, slotsFor(data, d));
    var label = document.getElementById('todayLabel');
    var clinic = document.getElementById('todayClinic');
    var time = document.getElementById('todayTime');

    if (box) {
      if (label) label.textContent = (label.textContent || '今日門診').replace(/（.*?）/, '') .replace('門診', '（週' + dayNames[d] + '）門診');
      if (today.length) {
        clinic.textContent = today.map(function (g) { return g.c; }).join('、');
        time.textContent = today.length === 1 ? today[0].t : today.map(function (g) { return g.c + ' ' + g.t; }).join('　');
      } else {
        var n = (d + 1) % 7, guard = 0;
        while (!slotsFor(data, n).length && guard < 7) { n = (n + 1) % 7; guard++; }
        var next = summarize(data, slotsFor(data, n));
        clinic.textContent = data.offText || '今日休診';
        time.textContent = next.length ? '下次門診 週' + dayNames[n] + ' ' + next[0].c : '';
      }
      box.hidden = false;
    }
    if (fab) {
      fab.textContent = today.length ? '今日 ' + today.map(function (g) { return g.c; }).join('、') : (data.offText || '今日休診');
    }
    /* 表格：高亮今日欄、標記空格 */
    var table = document.getElementById('schedTable');
    if (table) {
      table.querySelectorAll('[data-day="' + d + '"]').forEach(function (el) { el.classList.add('is-today'); });
      table.querySelectorAll('td').forEach(function (td) { if (!td.querySelector('.slot')) td.classList.add('off'); });
    }
  }

  /* ---------- 直排姓名：逐字堆疊（比 writing-mode 更穩定） ---------- */
  function initName() {
    document.querySelectorAll('.card-name:not(.is-split)').forEach(function (el) {
      var chars = Array.from(el.textContent.trim().replace(/\s+/g, ''));
      if (!chars.length) return;
      el.textContent = '';
      chars.forEach(function (ch) { var s = document.createElement('span'); s.textContent = ch; el.appendChild(s); });
      el.classList.add('is-split');
    });
  }

  /* ---------- 資歷列：「／」分隔 → 各自成 span，由 CSS 加分隔符 ---------- */
  function initSplit() {
    document.querySelectorAll('[data-split]').forEach(function (dd) {
      var parts = dd.textContent.split(/／|\s\/\s/).map(function (p) { return p.trim(); }).filter(Boolean);
      if (parts.length < 2) return;
      dd.textContent = '';
      parts.forEach(function (p) { var s = document.createElement('span'); s.textContent = p; dd.appendChild(s); });
    });
  }

  /* ---------- 選單：漢堡、行動版子選單、觸控裝置下拉 ---------- */
  function initMenu() {
    var burger = document.querySelector('.burger');
    var nav = document.getElementById('navMenu');
    if (!burger || !nav) return;
    function close() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', '開啟選單'); document.body.style.overflow = ''; }
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('.has-sub > a, .has-sub > .is-separator').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        var li = trigger.parentNode;
        var mobile = window.matchMedia('(max-width: 900px)').matches;
        var isSeparator = trigger.classList.contains('is-separator');
        if (mobile || isSeparator) {
          e.preventDefault();
          var open = li.classList.toggle('is-open');
          trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
      });
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (window.matchMedia('(max-width: 900px)').matches && !a.parentNode.classList.contains('has-sub')) close(); });
    });
    window.addEventListener('resize', function () { if (!window.matchMedia('(max-width: 900px)').matches) close(); });
  }

  /* ---------- 中文摘要截斷（Publii 以字數計算對 CJK 無效） ---------- */
  function initExcerpt() {
    var limit = parseInt(document.body.getAttribute('data-excerpt-chars'), 10) || 60;
    document.querySelectorAll('[data-excerpt]').forEach(function (p) {
      var t = p.textContent.replace(/\s+/g, ' ').trim();
      var chars = Array.from(t);
      if (chars.length > limit) t = chars.slice(0, limit).join('').replace(/[，、。；：]$/, '') + '…';
      p.textContent = t;
    });
  }

  /* ---------- 跨頁錨點：內頁點「#clinics」時導回首頁對應區段 ---------- */
  function initAnchorJump() {
    var home = (document.body.getAttribute('data-home-url') || '').replace(/\/+$/, '');
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) !== '#' || href.length < 2) return;
      var target = document.getElementById(href.slice(1));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      else if (home) { e.preventDefault(); window.location.href = home + '/' + href; }
    });
  }

  /* ---------- 服務項目延伸連結：全部留空時隱藏整列 ---------- */
  function initSvcMore() {
    // 連結目標已被刪除（頁面／標籤不存在）→ href 為空，移除連結層與提示
    document.querySelectorAll('.svc-link[href=""], .svc-more a[href=""]').forEach(function (a) {
      var cta = a.parentNode.querySelector('.svc-cta'); if (cta) cta.remove();
      a.remove();
    });
    document.querySelectorAll('.svc-more').forEach(function (row) { if (!row.querySelector('a')) row.remove(); });
  }

  /* ---------- 案例：術前術後滑桿 ---------- */
  function initBA() {
    document.querySelectorAll('.ba').forEach(function (ba) {
      var r = ba.querySelector('input[type=range]');
      if (!r) return;
      var upd = function () { ba.style.setProperty('--pos', r.value + '%'); };
      r.addEventListener('input', upd);
      upd();
    });
  }

  /* ---------- 案例：術前／術後點擊切換 ---------- */
  function initCaseToggle() {
    document.querySelectorAll('[data-case-toggle]').forEach(function (ct) {
      var btns = ct.querySelectorAll('[data-ct]'), imgs = ct.querySelectorAll('[data-ct-img]');
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-ct');
          btns.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
          imgs.forEach(function (im) { im.hidden = im.getAttribute('data-ct-img') !== k; });
        });
      });
    });
  }

  function init() { initToday(); initName(); initSplit(); initMenu(); initExcerpt(); initAnchorJump(); initSvcMore(); initBA(); initCaseToggle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
