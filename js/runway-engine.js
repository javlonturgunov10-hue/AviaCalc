/*
 * AviaCalc | Runway length: calculation engine
 * TOW and Lb are read from the diagram data; no DOM access.
 * Author: Turgunov J (Student ID AE18097)
 */

window.AviaCalc = window.AviaCalc || {};
AviaCalc.runway = (function () {
  var KLB = 453.59237; // kg per 1000 lb
  var T1 = AviaCalc.runwayData.T1, FUELX = AviaCalc.runwayData.FUELX, Z0 = AviaCalc.runwayData.Z0;
  // Module 2: calculation engine (no DOM access)
  var SX = 50.4, SY = 1.254; // diagram 1 scale (pixels per 1000 NM and per 1000 lb), used to measure geometric distance
  function at(p, x) {
    if (x < p[0][0] || x > p[p.length - 1][0]) return null;
    for (var i = 1; i < p.length; i++) if (x <= p[i][0]) { var a = p[i - 1], b = p[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); }
    return null;
  }
  function segDist(px, py, a, b) {
    var ax = a[0] * SX, ay = a[1] * SY, dx = b[0] * SX - ax, dy = b[1] * SY - ay;
    var t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  // TOW: the Brake Release Gross Weight line geometrically closest to the target point
  function findTow(rg, ms) {
    var X = rg / 1000, Y = ms / 1000, P = ms / KLB, px = X * SX, py = P * SY, D = [], why = [];
    T1.forEach(function (l) {
      var m = 1e9;
      for (var i = 1; i < l[2].length; i++) m = Math.min(m, segDist(px, py, l[2][i - 1], l[2][i]));
      D.push({k: l[0], lb: l[1], d: m});
    });
    D.sort(function (a, b) { return a.d - b.d; });
    var xb = at(FUELX, P); if (xb === null) xb = P > 586.1 ? 99 : 8.7;
    if (X > 10) why.push('the range is beyond the 10,000 NM edge of the diagram');
    if (P > 727) why.push('OEW + Payload is above the maximum zero fuel weight line (329,762 kg)');
    if (P < 480) why.push('OEW + Payload is below the lowest value plotted (about 217,700 kg)');
    if (X > xb) why.push('the point lies beyond the fuel capacity line');
    var lo = null, hi = null;
    T1.forEach(function (l) { var p = at(l[2], X); if (p === null) return; if (p <= P) lo = {k: l[0], lb: l[1]}; else if (!hi) hi = {k: l[0], lb: l[1]}; });
    return {X: X, Y: Y, P: P, line: D[0], lo: lo, hi: hi, why: why, tow: D[0].k * 1000,
      status: why.length ? 'boundary' : (D[0].d <= 2 ? 'exact' : 'nearest')};
  }
  // TOR: 0 ft curve of diagram 2; outside the plotted weights the nearest chart boundary is used (approximate)
  function findLb(tow) {
    var k = tow / KLB, u = Math.min(875, Math.max(500, k)), st = 'exact', why = '';
    if (k > 875) { st = 'boundary'; why = 'the TOW is above the maximum design take-off weight of the diagram (396,894 kg), so the right-hand chart boundary was used'; }
    else if (k < 500) { st = 'boundary'; why = 'the TOW is below the lightest weight plotted (about 226,800 kg), so the left-hand chart boundary was used'; }
    return {k: k, u: u, lb: at(Z0, u), status: st, why: why, flat: u <= 665};
  }
  function run(v) {
    var s = {v: v}, a = findTow(v.rg, v.ms), r1 = function (x) { return Math.round(x * 10) / 10; }, R = {exact: 0, nearest: 1, boundary: 2};
    s.a = a; s.tow = a.tow;
    var b = findLb(s.tow); s.b = b; s.lbRaw = b.lb; s.lb = Math.round(b.lb / 10) * 10;
    s.status = R[a.status] >= R[b.status] ? a.status : b.status;
    s.la = r1(s.lb * v.alt * 0.07 / 300 + s.lb);
    s.ta = Math.round((15 - 0.0065 * v.alt) * 100) / 100;
    s.lt = r1(s.la * (v.tr - s.ta) * 0.01 + s.la);
    s.lr = r1(s.lt * v.gr * 0.1 + s.lt);
    return s;
  }
  return {run: run};
})();
