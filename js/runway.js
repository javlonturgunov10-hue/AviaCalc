/*
 * AviaCalc | Runway length screen
 * Five inputs, automatic calculation, step-by-step solution and PDF.
 * Author: Turgunov J (Student ID AE18097)
 */

(function () {
  var $ = function (i) { return document.getElementById(i); };
  var run = AviaCalc.runway.run;
  var N = function (x, d) { return Number(x).toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d}); };
  // Screen: solution report and form
  var q = function (x) { return x < 0 ? '(' + x + ')' : String(x); };
  var DISCT = 'This is an aircraft performance calculation aid, not a certified performance tool. TOW and Lb are approximate readings of the supplied diagrams. Check all values against the applicable aircraft flight manual, approved performance data and regulations before operational use. Lr is not an approved runway requirement or a guarantee of take-off performance.';
  var ST = {exact: 'Exact graphical intersection', nearest: 'Nearest available plotted value (approximate)', boundary: 'Approximate chart-boundary value (the exact value cannot be determined from the chart)'};
  var TG = {exact: 'exact reading', nearest: 'nearest line', boundary: 'boundary value'};
  var lastM = null;
  var PB = function (v) { return {t: 'p', v: v}; }, FB = function (f, s) { return {t: 'f', f: f, s: s}; }, RB = function (l, v) { return {t: 'r', l: l, v: v}; }, NB = function (k, v) { return {t: 'n', k: k, v: v}; };
  function model(s) {
    var v = s.v, a = s.a, b = s.b, ok = s.status === 'exact';
    var where = a.lo && a.hi ? 'It falls between the ' + a.lo.k + ' and ' + a.hi.k + ' (thousand kg) Brake Release Gross Weight lines.' : 'It falls outside the band covered by the plotted lines at this range.';
    var near = a.why.length ? ' It also lies outside the plotted region, because ' + a.why.join(' and ') + '.' : '';
    return {slug: 'runway-length', title: 'Runway length', date: new Date().toLocaleDateString('en-GB'), disc: DISCT,
      notice: ok ? '' : 'Approximate result. ' + ST[s.status] + '. See step 1 for the line, curve and reason used.',
      final: {label: 'Final take-off run (Lr)', value: N(s.lr, 1), unit: 'm', tag: ok ? '' : 'approximate'},
      rows: [['TOW', N(s.tow, 0) + ' kg', TG[a.status]], ['Initial take-off run (Lb)', '≈ ' + N(s.lb, 0) + ' m', TG[b.status]], ['Altitude-corrected (La)', N(s.la, 1) + ' m', 'calculated'],
        ['Standard temperature (Ta)', N(s.ta, 2) + ' °C', 'calculated'], ['Temperature-corrected (Lt)', N(s.lt, 1) + ' m', 'calculated'], ['Gradient-corrected (Lr)', N(s.lr, 1) + ' m', 'calculated']],
      inputs: [['Airport altitude', v.alt + ' m'], ['Reference temperature (Tr)', v.tr + ' °C'], ['Runway gradient', v.gr + ' %'], ['OEW + Payload', v.ms + ' kg'], ['Range', v.rg + ' NM']],
      stages: [
        {title: 'Finding TOW and Lb from the diagrams', b: [
          PB('Take-off weight (TOW). With a range of ' + v.rg + ' NM and OEW + Payload of ' + v.ms + ' kg, your point sits at X = ' + N(a.X, 3) + ' (thousand NM) and Y = ' + N(a.Y, 3) + ' (thousand kg) on the weight-range diagram. ' + where + near),
          PB('The closest line is the ' + a.line.k + ' (thousand kg) line, and its printed label gives the take-off weight.'),
          FB('TOW = label of the closest line × 1000', 'TOW = ' + a.line.k + ' × 1000'), RB('TOW', N(s.tow, 0) + ' kg'), NB(a.status, 'Reading accuracy: ' + ST[a.status] + '.'),
          PB('Take-off run (Lb). On the take-off runway diagram, a line is drawn up from ' + N(s.tow, 0) + ' kg to the 0 ft pressure-altitude curve (standard day, 15 °C, 0 % gradient).' + (b.why ? ' Note: ' + b.why + '.' : '') + (b.flat ? ' At this weight the curve is in its flat, lowest section.' : '') + ' Reading across to the runway length axis and converting to metres gives Lb.'),
          RB('Lb', '≈ ' + N(s.lb, 0) + ' m'), NB(b.status, 'Reading accuracy: ' + ST[b.status] + '. The unrounded reading (' + N(s.lbRaw, 1) + ' m) is kept for verification.')]},
        {title: 'Correcting for airport altitude (La)', b: [
          PB('Thinner air at higher airports means a longer take-off run, so Lb is increased by 7 % for every 300 m of airport elevation.'),
          FB('La = (Lb × altitude × 0.07 / 300) + Lb', 'La = (' + s.lb + ' × ' + q(v.alt) + ' × 0.07 / 300) + ' + s.lb), RB('La', N(s.la, 1) + ' m')]},
        {title: 'Correcting for temperature (Lt)', b: [
          PB('First, the standard temperature at the airport\u2019s elevation is found; it falls by 0.0065 °C for every metre of height.'),
          FB('Ta = 15 - (0.0065 × altitude)', 'Ta = 15 - (0.0065 × ' + q(v.alt) + ')'), RB('Ta', N(s.ta, 2) + ' °C'),
          PB('Lt then raises La by 1 % for each degree the reference temperature is above that standard value, or lowers it when the airport is colder.'),
          FB('Lt = (La × (Tr - Ta) × 0.01) + La', 'Lt = (' + s.la + ' × (' + q(v.tr) + ' - ' + q(s.ta) + ') × 0.01) + ' + s.la), RB('Lt', N(s.lt, 1) + ' m')]},
        {title: 'Correcting for runway gradient (Lr)', b: [
          PB('An uphill runway lengthens the take-off run, so Lr adds 10 % of Lt for every 1 % of runway gradient (a downhill gradient reduces it).'),
          FB('Lr = (Lt × gradient × 0.1) + Lt', 'Lr = (' + s.lt + ' × ' + q(v.gr) + ' × 0.1) + ' + s.lt), RB('Lr', N(s.lr, 1) + ' m')]}]};
  }
  var F = [['alt', 'Airport altitude', 'm', '', 'text'], ['tr', 'Airport reference temperature (Tr)', '°C', '', 'text'], ['gr', 'Runway gradient', '%', 'Usually from 0.5% to 2%', 'text'],
    ['ms', 'Aircraft total mass (OEW + Payload)', 'kg', '', 'decimal'], ['rg', 'Aircraft range', 'NM', '', 'decimal']];
  var touched = {}, RX = /^[+-]?([0-9]+[.]?[0-9]*|[.][0-9]+)$/;
  $('rfields').innerHTML = F.map(function (f) {
    return '<div class="rf"><label class="fld" for="r-' + f[0] + '">' + f[1] + '</label><div class="uw"><input id="r-' + f[0] + '" type="text" inputmode="' + f[4] + '" autocomplete="off" placeholder="Enter a value"><span class="un">' + f[2] + '</span></div>' +
      (f[3] ? '<p class="note">' + f[3] + '</p>' : '') + '<p class="msg" id="e-' + f[0] + '" role="alert"></p></div>';
  }).join('');
  function steps(n, bad) {
    var li = $('steps').children;
    for (var i = 0; i < 4; i++) li[i].className = bad && i === 0 ? 'bad' : (i < n ? 'done' : '');
  }
  function update() {
    var v = {}, ok = 0;
    F.forEach(function (f) {
      var s = $('r-' + f[0]).value.trim().replace(',', '.'), msg = '';
      if (!s) { if (touched[f[0]]) msg = 'This value is required.'; }
      else if (!RX.test(s)) msg = 'Enter a number using digits and one decimal point only.';
      else {
        var n = +s;
        if (f[0] === 'rg' && n < 0) msg = 'The range cannot be negative.';
        else if (f[0] === 'ms' && n <= 0) msg = 'The mass must be greater than 0.';
        else { v[f[0]] = n; ok++; }
      }
      $('e-' + f[0]).textContent = msg;
    });
    $('rcount').textContent = ok === 5 ? 'All five values entered. Results update automatically.' : ok + ' of 5 values entered. Enter all five to start the calculation.';
    if (ok < 5) { $('rout').hidden = true; steps(0); return; }
    var s = run(v);
    lastM = model(s); $('rrep').innerHTML = AviaCalc.report.html(lastM); $('rout').hidden = false;
    steps(s.err ? 0 : 4, !!s.err);
  }
  F.forEach(function (f) {
    var el = $('r-' + f[0]);
    el.addEventListener('input', update);
    el.addEventListener('blur', function () { touched[f[0]] = true; update(); });
  });
  $('rlink').addEventListener('click', function () { $('ref').hidden = !$('ref').hidden; });
  $('rprint').addEventListener('click', function () { if (lastM) AviaCalc.report.save(lastM, '#FFC933', '#0B1B3F', this); });
  $('rclear').addEventListener('click', function () {
    F.forEach(function (f) { $('r-' + f[0]).value = ''; }); touched = {}; update(); $('r-alt').focus();
  });
  $('rback').addEventListener('click', function () { location.hash = '#problems'; });
  update();
})();
