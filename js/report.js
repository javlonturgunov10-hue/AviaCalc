/*
 * AviaCalc | Solution report
 * Builds the on-screen solution layout and the PDF download.
 * The PDF library (jsPDF) is loaded from cdnjs in index.html; without it the print dialog is used.
 * Author: Turgunov J (Student ID AE18097)
 */

window.AviaCalc = window.AviaCalc || {};
(function () {
  var E = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  var L = function (s) { return E(s).replace(/\n/g, '<br>'); };
  function blk(b) {
    if (b.t === 'p') return '<p class="why">' + E(b.v) + '</p>';
    if (b.t === 'f') return '<div class="frm"><span>Formula</span><code>' + L(b.f) + '</code><span>With your values</span><code>' + L(b.s) + '</code></div>';
    if (b.t === 'r') return '<div class="rp"><span>' + E(b.l) + '</span><b>' + E(b.v) + '</b></div>';
    return '<p class="acc ' + (b.k === 'exact' ? 'ok' : 'warn') + '">' + E(b.v) + '</p>';
  }
  function chip(r) { return '<div class="chip"><small>' + E(r[0]) + '</small><b>' + E(r[1]) + '</b>' + (r[2] ? '<i class="tag">' + E(r[2]) + '</i>' : '') + '</div>'; }
  function html(m) {
    var h = '<h3 class="ptitle">AviaCalc: ' + E(m.title) + ' report</h3><p class="ptitle">' + E(m.date) + '</p>';
    if (m.notice) h += '<div class="amber">' + E(m.notice) + '</div>';
    h += '<div class="res"><label class="fld">' + E(m.final.label) + (m.final.tag ? '<i class="tag">' + E(m.final.tag) + '</i>' : '') + '</label><div class="rval">' + E(m.final.value) + '<small>' + E(m.final.unit) + '</small></div></div>';
    h += '<div class="sumg">' + m.rows.map(chip).join('') + '</div>';
    h += '<h3 class="sect">How the answer was found</h3><div class="inp"><h4>Your inputs</h4><div class="sumg">' + m.inputs.map(chip).join('') + '</div></div>';
    h += '<div class="tl">' + m.stages.map(function (s, i) {
      return '<div class="st"><span class="sn">' + (i + 1) + '</span><div class="sc"><h4>' + E(s.title) + '</h4>' + s.b.map(blk).join('') + '</div></div>';
    }).join('') + '</div>';
    return h + '<p class="disc">' + E(m.disc) + '</p>';
  }
  function rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function pdf(m, col, ink) {
    var J = window.jspdf && window.jspdf.jsPDF; if (!J) return null;
    var d = new J({unit: 'mm', format: 'a4'}), W = 210, M = 16, CW = W - 2 * M, y = 0;
    var A = rgb(col), I = rgb(ink), T = [11, 27, 63], G = [86, 96, 127], LN = [208, 220, 231];
    var S = function (s) { return String(s).replace(/\u2248/g, 'approx. ').replace(/[\u2212\u2013\u2014]/g, '-').replace(/[\u2018\u2019]/g, "'"); };
    var need = function (h) { if (y + h > 272) { d.addPage(); y = M; } };
    var font = function (f, st, sz, c) { d.setFont(f, st); d.setFontSize(sz); d.setTextColor(c[0], c[1], c[2]); };
    var wrap = function (t, w) { return d.splitTextToSize(S(t), w); };
    var write = function (t, o) {
      var sz = o.size || 10, lh = sz * 0.5; font('helvetica', o.style || 'normal', sz, o.color || T);
      wrap(t, o.w).forEach(function (l) { need(lh); d.text(l, o.x, y + lh * 0.75); y += lh; });
    };
    d.setFillColor(A[0], A[1], A[2]); d.rect(0, 0, W, 32, 'F');
    font('helvetica', 'bold', 11, I); d.text('AviaCalc', M, 12);
    font('helvetica', 'normal', 10, I); d.text(S(m.date), W - M, 12, {align: 'right'});
    font('helvetica', 'bold', 22, I); d.text(S(m.title), M, 25);
    y = 42;
    if (m.notice) {
      var nl = wrap(m.notice, CW - 8), nh = nl.length * 5 + 6; need(nh);
      d.setFillColor(255, 247, 224); d.roundedRect(M, y, CW, nh, 2, 2, 'F'); font('helvetica', 'bold', 10, [91, 67, 0]);
      nl.forEach(function (l, i) { d.text(l, M + 4, y + 6 + i * 5); }); y += nh + 6;
    }
    need(36); d.setFillColor(A[0], A[1], A[2]); d.roundedRect(M, y, CW, 32, 4, 4, 'F');
    font('helvetica', 'normal', 10, I); d.text(S(m.final.label) + (m.final.tag ? '  (' + m.final.tag + ')' : ''), M + 8, y + 9);
    font('helvetica', 'bold', 28, I); d.text(S(m.final.value), M + 8, y + 24);
    var vw = d.getTextWidth(S(m.final.value)); font('helvetica', 'normal', 14, I); d.text(S(m.final.unit), M + 8 + vw + 3, y + 24);
    y += 40;
    var table = function (title, rows) {
      need(16); font('helvetica', 'bold', 13, T); d.text(title, M, y + 4); y += 8;
      rows.forEach(function (r) {
        need(8); font('helvetica', 'normal', 10, G); d.text(S(r[0]), M, y + 5);
        font('helvetica', 'bold', 10, T); d.text(S(r[1]) + (r[2] ? '  [' + r[2] + ']' : ''), W - M, y + 5, {align: 'right'});
        d.setDrawColor(LN[0], LN[1], LN[2]); d.line(M, y + 7, W - M, y + 7); y += 8;
      });
      y += 5;
    };
    table('Summary', m.rows); table('Your inputs', m.inputs);
    need(14); font('helvetica', 'bold', 13, T); d.text('How the answer was found', M, y + 4); y += 11;
    var X = M + 12, w = CW - 12;
    m.stages.forEach(function (s, i) {
      need(26);
      d.setFillColor(A[0], A[1], A[2]); d.circle(M + 4.5, y + 4.5, 4.5, 'F');
      font('helvetica', 'bold', 10, I); d.text(String(i + 1), M + 4.5, y + 5.9, {align: 'center'});
      font('helvetica', 'bold', 12, T); d.text(S(s.title), X, y + 5.6); y += 11;
      s.b.forEach(function (b) {
        if (b.t === 'p') { write(b.v, {x: X, w: w, size: 10}); y += 2; }
        else if (b.t === 'f') {
          font('courier', 'normal', 9, T);
          var fl = wrap(b.f, w - 8), sl = wrap(b.s, w - 8), h = 16 + (fl.length + sl.length) * 4.4;
          need(h); d.setFillColor(244, 247, 255); d.rect(X, y, w, h, 'F'); d.setFillColor(A[0], A[1], A[2]); d.rect(X, y, 1.2, h, 'F');
          var yy = y + 4.5; font('helvetica', 'bold', 7, G); d.text('FORMULA', X + 5, yy); yy += 4;
          font('courier', 'normal', 9, T); fl.forEach(function (l) { d.text(l, X + 5, yy); yy += 4.4; });
          yy += 1.5; font('helvetica', 'bold', 7, G); d.text('WITH YOUR VALUES', X + 5, yy); yy += 4;
          font('courier', 'normal', 9, T); sl.forEach(function (l) { d.text(l, X + 5, yy); yy += 4.4; });
          y += h + 3;
        } else if (b.t === 'r') {
          var tx = S(b.l + ' = ' + b.v); font('helvetica', 'bold', 11, I); var tw = d.getTextWidth(tx) + 10;
          need(10); d.setFillColor(A[0], A[1], A[2]); d.roundedRect(X, y, tw, 8, 4, 4, 'F'); d.text(tx, X + 5, y + 5.6); y += 11;
        } else { write(b.v, {x: X, w: w, size: 9, style: 'italic', color: b.k === 'exact' ? [10, 107, 79] : [91, 67, 0]}); y += 2; }
      });
      y += 4;
    });
    var n = d.getNumberOfPages();
    for (var p = 1; p <= n; p++) {
      d.setPage(p); font('helvetica', 'normal', 7, G); d.text(wrap(m.disc, CW), M, 280);
      d.text('AviaCalc | © 2026 Turgunov J, ID AE18097 | Page ' + p + ' of ' + n, W - M, 294, {align: 'right'});
    }
    return d;
  }
  function save(m, col, ink, btn) {
    var old = btn ? btn.textContent : '';
    var done = function (t) { if (btn) { btn.textContent = t; setTimeout(function () { btn.textContent = old; }, 2200); } };
    var d; try { d = pdf(m, col, ink); } catch (e) { d = null; }
    if (!d) { window.print(); return; }
    var name = 'AviaCalc-' + m.slug + '-report.pdf';
    (async function () {
      try {
        if (window.claude && window.claude.use) {
          var dl = await window.claude.use('downloads');
          if (dl) { await dl.save({filename: name, data: d.output('arraybuffer')}); done('PDF saved'); return; }
        }
      } catch (e) { if (e && e.code === 'declined') return; }
      try { d.save(name); done('PDF saved'); } catch (e2) { window.print(); }
    })();
  }
  AviaCalc.report = {html: html, save: save, pdf: pdf};
})();
