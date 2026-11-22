/*
 * AviaCalc | Unit conversion engine
 * Units are grouped by category; linear units convert through a base unit,
 * temperature uses formulas. No DOM access.
 * Author: Turgunov J (Student ID AE18097)
 */

window.AviaCalc = window.AviaCalc || {};
AviaCalc.converter = (function () {
  var MM = 133.322387415; // Pa per mmHg (conventional)
  var CATS = [
    {id:'distance', n:'Distance', c:'#2F5BFF', ic:'M2 9h20v6H2zM6 9v3M10 9v3M14 9v3M18 9v3', d:['NM','km'], u:[['NM',1852],['km',1000],['m',1],['ft',0.3048],['mi',1609.344]]},
    {id:'speed', n:'Speed', c:'#F2553E', ic:'M4 17a9 9 0 1 1 16 0M12 14l4-5', d:['kt','km/h'], u:[['kt',1852/3600],['km/h',1000/3600],['m/s',1],['mph',0.44704],['ft/s',0.3048]]},
    {id:'mass', n:'Mass & Weight', c:'#10A57C', ic:'M6 8h12l2 13H4zM9 8a3 3 0 1 1 6 0', d:['kg','lb'], u:[['kg',1],['g',0.001],['lb',0.45359237],['tonne',1000]]},
    {id:'pressure', n:'Pressure', c:'#8B5CF6', ic:'M12 3v11M7 10l5 5 5-5M5 20h14', d:['hPa','inHg'], u:[['hPa',100],['Pa',1],['kPa',1000],['bar',100000],['psi',0.45359237*9.80665/(0.0254*0.0254)],['inHg',25.4*MM],['mmHg',MM]]},
    {id:'temp', n:'Temperature', c:'#FFC933', ci:'#0B1B3F', ic:'M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z', d:['°C','°F'], t:1, u:[['°C'],['°F'],['K']]},
    {id:'time', n:'Time', c:'#0B8FD0', ic:'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2', d:['h','min'], u:[['h',3600],['min',60],['s',1],['ms',0.001]]},
    {id:'volume', n:'Volume & Fuel', c:'#D6336C', ic:'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z', d:['L','US gal'], u:[['L',1],['mL',0.001],['US gal',3.785411784],['Imperial gal',4.54609],['m³',1000]]},
    {id:'force', n:'Force & Thrust', c:'#14233F', ic:'M3 5v14M7 12h13M15 7l5 5-5 5', d:['kN','lbf'], u:[['N',1],['kN',1000],['lbf',4.4482216152605],['kgf',9.80665]]}
  ];
  // Temperature: convert through Celsius with formulas (no fixed factors)
  var TC = {'°C': function (x) { return x; }, '°F': function (x) { return (x - 32) * 5 / 9; }, 'K': function (x) { return x - 273.15; }};
  var FC = {'°C': function (c) { return c; }, '°F': function (c) { return c * 9 / 5 + 32; }, 'K': function (c) { return c + 273.15; }};
  var TF = {'°C>°F': '(v × 9/5) + 32', '°F>°C': '(v − 32) × 5/9', '°C>K': 'v + 273.15', 'K>°C': 'v − 273.15', '°F>K': '(v − 32) × 5/9 + 273.15', 'K>°F': '(v − 273.15) × 9/5 + 32'};
  // Central engine: convert through the category base unit; units from other categories are rejected
  function conv(cat, a, b, v) {
    var A = cat.u.filter(function (x) { return x[0] === a; })[0];
    var B = cat.u.filter(function (x) { return x[0] === b; })[0];
    if (!A || !B) return {err: 'These units cannot be converted.'};
    if (cat.t) {
      var c = TC[a](v);
      if (c < -273.15 - 1e-9) return {err: 'Temperature cannot be below absolute zero (−273.15 °C).'};
      return {r: FC[b](c), f: a === b ? 'v' : TF[a + '>' + b]};
    }
    return {r: v * A[1] / B[1], k: A[1] / B[1]};
  }
  var NF = new Intl.NumberFormat('en-US', {maximumFractionDigits: 6, useGrouping: false});
  function fmt(x) { return x === 0 ? '0' : Math.abs(x) < 5e-7 ? x.toExponential(4) : NF.format(x); }
  function parse(s) {
    s = s.trim();
    if (s.indexOf('.') < 0) s = s.replace(',', '.');
    if (/^[+-]?[.]?$/.test(s)) return null;
    if (!/^[+-]?([0-9]+[.]?[0-9]*|[.][0-9]+)(e[+-]?[0-9]+)?$/i.test(s)) return NaN;
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }
  return {CATS: CATS, conv: conv, fmt: fmt, parse: parse};
})();
