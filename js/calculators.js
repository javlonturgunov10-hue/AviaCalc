/*
 * AviaCalc | Calculator screens
 * Shared form, validation and results for the four calculators.
 * Author: Turgunov J (Student ID AE18097)
 */

(function () {
  var $ = function (i) { return document.getElementById(i); };
  var CFG = AviaCalc.calculators.configs, G = AviaCalc.calculators.fmt;
  var cur = '', touched = {}, RX = /^[+-]?([0-9]+[.]?[0-9]*|[.][0-9]+)$/;
  var lastG = null;
  var PB = function (v) { return {t: 'p', v: v}; }, FB = function (f, s) { return {t: 'f', f: f, s: s}; }, RB = function (l, v) { return {t: 'r', l: l, v: v}; };
  function model(c, v, s) {
    var last = s.steps[s.steps.length - 1], fm = function (x) { return G(x.r[0]) + ' ' + x.r[1]; };
    return {slug: cur, title: c.title, date: new Date().toLocaleDateString('en-GB'), notice: s.warn,
      disc: 'Results are shown to up to 3 decimal places; the calculation uses full precision. This is a calculation aid: check results against the applicable standards and data before use.',
      final: {label: c.final, value: G(last.r[0]), unit: last.r[1], tag: ''},
      rows: s.steps.map(function (x) { return [x.sum, fm(x), '']; }),
      inputs: c.f.map(function (f) { return [f[1], v[f[0]] + ' ' + f[2]]; }),
      stages: s.steps.map(function (x) { return {title: x.n.replace(/^Step [0-9]+: /, ''), b: [PB(x.why), FB(x.f[0], x.f.slice(1).join('\n')), RB(x.name, fm(x))]}; })};
  }
  function update() {
    var c = CFG[cur], v = {}, ok = 0;
    c.f.forEach(function (f) {
      var s = $('g-' + f[0]).value.trim().replace(',', '.'), msg = '';
      if (!s) { if (touched[f[0]]) msg = 'This value is required.'; }
      else if (!RX.test(s)) msg = 'Enter a number using digits and one decimal point only.';
      else { var n = +s; msg = f[4](n); if (!msg) { v[f[0]] = n; ok++; } }
      $('ge-' + f[0]).textContent = msg;
    });
    $('gcount').textContent = ok === c.f.length ? 'All values entered. Results update automatically.' : ok + ' of ' + c.f.length + ' values entered. Enter all of them to see the solution.';
    if (ok < c.f.length) { $('gout').hidden = true; return; }
    lastG = model(c, v, c.run(v)); $('grep').innerHTML = AviaCalc.report.html(lastG); $('gout').hidden = false;
  }
  function open(k) {
    var c = CFG[k]; cur = k; touched = {};
    $('gc').style.cssText = '--c:' + c.c + ';--ci:' + c.ci;
    $('gh').textContent = c.title; $('gsub').textContent = c.sub;
    $('gfields').innerHTML = c.f.map(function (f) {
      return '<div class="rf"><label class="fld" for="g-' + f[0] + '">' + f[1] + '</label><div class="uw"><input id="g-' + f[0] + '" type="text" inputmode="decimal" autocomplete="off" placeholder="Enter a value"><span class="un">' + f[2] + '</span></div>' +
        (f[3] ? '<p class="note">' + f[3] + '</p>' : '') + '<p class="msg" id="ge-' + f[0] + '" role="alert"></p></div>';
    }).join('');
    update();
  }
  function route() {
    var k = location.hash.slice(1), c = CFG[k];
    $('gc').hidden = !c;
    if (c && k !== cur) open(k);
    if (!c) cur = '';
  }
  $('gfields').addEventListener('input', update);
  $('gfields').addEventListener('focusout', function (e) { if (e.target.id) { touched[e.target.id.slice(2)] = true; update(); } });
  $('gprint').addEventListener('click', function () { if (lastG) AviaCalc.report.save(lastG, CFG[cur].c, CFG[cur].ci === '#fff' ? '#FFFFFF' : CFG[cur].ci, this); });
  $('gclear').addEventListener('click', function () {
    CFG[cur].f.forEach(function (f) { $('g-' + f[0]).value = ''; }); touched = {}; update(); $('g-' + CFG[cur].f[0][0]).focus();
  });
  $('gback').addEventListener('click', function () { location.hash = '#problems'; });
  window.addEventListener('hashchange', route); route();
})();
