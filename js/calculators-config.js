/*
 * AviaCalc | Calculator definitions
 * Taxiway curves, gate capacity, terminal capacity and operation time.
 * Each entry lists its inputs and a run() that returns the solution steps.
 * Author: Turgunov J (Student ID AE18097)
 */

window.AviaCalc = window.AviaCalc || {};
AviaCalc.calculators = (function () {
  var G = function (x) { return Number(x).toLocaleString('en-US', {maximumFractionDigits: 3}); };
  var pos = function (n) { return n > 0 ? '' : 'Must be greater than 0.'; };
  var whole = function (n) { return n >= 1 && n === Math.floor(n) ? '' : 'Enter a whole number, 1 or more.'; };
  function S(name, sum, n, why, f, r) { return {name: name, sum: sum, n: n, why: why, f: f, r: r}; }
  var CFG = {
    'taxiway-curves': {title: 'Taxiway curves', sub: 'Enter the turning angle, aircraft speed and entrance curve radius.', c: '#F2553E', ci: '#fff', final: 'Length of central curve (length2)',
      f: [['angle', 'Turning angle', '°', '', function (n) { return n > 0 && n <= 180 ? '' : 'Enter an angle greater than 0 and up to 180 degrees.'; }], ['speed', 'Aircraft speed', 'km/h', '', pos], ['radius1', 'Radius of entrance curve', 'm', '', pos]],
      run: function (v) {
        var r2 = v.speed * v.speed / (125 * 0.13), l1 = Math.pow(v.speed, 3) / (45.5 * 0.39 * r2);
        var da = v.angle - (180 * l1 / (3.14 * v.radius1)), l2 = 3.14 * r2 * da / 180;
        return {warn: da <= 0 ? 'The deflection angle is zero or negative, so the entrance curve already uses up the whole turning angle and the central curve length is not meaningful. Check the turning angle, speed and entrance curve radius.' : '', steps: [
          S('radius2', 'Radius of central curve (radius2)', 'Step 1: Radius of the central curve (radius2)', 'The speed sets how wide the main curve of the turn must be: the faster the aircraft turns, the larger the radius it needs.',
            ['radius2 = speed × speed / (125 × 0.13)', 'radius2 = ' + v.speed + ' × ' + v.speed + ' / (125 × 0.13)'], [r2, 'm']),
          S('length1', 'Length of entrance curve (length1)', 'Step 2: Length of the entrance curve (length1)', 'Next comes the entrance curve, the gradual transition that eases the aircraft into the central curve at this speed.',
            ['length1 = speed³ / (45.5 × 0.39 × radius2)', 'length1 = ' + v.speed + '³ / (45.5 × 0.39 × ' + G(r2) + ')'], [l1, 'm']),
          S('def_angle', 'Deflection angle (def_angle)', 'Step 3: Deflection angle (def_angle)', 'The entrance curve already uses up part of the turn. Taking it away from the total turning angle leaves the deflection angle for the central curve.',
            ['def_angle = angle - (180 × length1 / (3.14 × radius1))', 'def_angle = ' + v.angle + ' - (180 × ' + G(l1) + ' / (3.14 × ' + v.radius1 + '))'], [da, 'degrees']),
          S('length2', 'Length of central curve (length2)', 'Step 4: Length of the central curve (length2)', 'Finally, the central curve is the arc that carries the aircraft through the remaining deflection angle.',
            ['length2 = 3.14 × radius2 × def_angle / 180', 'length2 = 3.14 × ' + G(r2) + ' × ' + G(da) + ' / 180'], [l2, 'm'])]};
      }},
    'gate-capacity': {title: 'Gate capacity', sub: 'Enter the number of gates, utilization factor and occupancy time.', c: '#10A57C', ci: '#fff', final: 'Gate capacity',
      f: [['gates', 'Number of gates', 'gates', '', whole], ['util', 'Utilization factor', '%', '', function (n) { return n > 0 && n <= 100 ? '' : 'Enter a value greater than 0 and up to 100.'; }], ['time', 'Occupancy time', 'min', '', pos]],
      run: function (v) {
        var c = v.gates * (v.util / 100) / (v.time / 60);
        return {warn: '', steps: [S('capacity', 'Gate capacity', 'Gate capacity', 'Each gate can only serve as many aircraft as its usable time allows. Multiplying the gates by the utilization factor and dividing by the occupancy time in hours gives the number of aircraft the gates can handle every hour.',
          ['capacity = gates × (utilization factor / 100) / (time / 60)', 'capacity = ' + v.gates + ' × (' + v.util + ' / 100) / (' + v.time + ' / 60)', 'capacity = ' + v.gates + ' × ' + G(v.util / 100) + ' / ' + G(v.time / 60)], [c, 'aircraft per hour'])]};
      }},
    'terminal-capacity': {title: 'Terminal capacity', sub: 'Enter the number of gates, operating hours and service time per passenger.', c: '#0B8FD0', ci: '#fff', final: 'Terminal capacity per day',
      f: [['gates', 'Number of gates', 'gates', '', whole], ['hours', 'Operating hours', 'h', '', function (n) { return n > 0 && n <= 24 ? '' : 'Enter hours greater than 0 and up to 24.'; }], ['service', 'Service time per passenger', 'min', '', pos]],
      run: function (v) {
        var c = v.gates * 60 * v.hours / v.service;
        return {warn: '', steps: [S('capacity per day', 'Capacity per day', 'Terminal capacity per day', 'Every gate has 60 minutes of service time in each hour. Multiplying by the number of gates and the operating hours, then dividing by the service time per passenger, gives how many passengers the terminal can handle in a day.',
          ['capacity per day = (gates × 60 × operating hours) / service time', 'capacity per day = (' + v.gates + ' × 60 × ' + v.hours + ') / ' + v.service], [c, 'passengers per day'])]};
      }},
    'operation-time': {title: 'Operation time of aircraft', sub: 'Enter the touchdown distance and the two velocities.', c: '#8B5CF6', ci: '#fff', final: 'Operation time',
      f: [['dist', 'Touchdown distance', 'm', '', pos], ['vth', 'Velocity of aircraft at threshold', 'm/s', '', pos], ['vtd', 'Touchdown velocity', 'm/s', '', pos]],
      run: function (v) {
        var t = 2 * v.dist / (v.vth + v.vtd);
        return {warn: '', steps: [S('operation time', 'Operation time', 'Operation time', 'The aircraft covers the touchdown distance while its speed changes from the threshold speed to the touchdown speed, so the time follows from the distance and the average of those two speeds.',
          ['operation time = (2 × touchdown distance) / (threshold speed + touchdown speed)', 'operation time = (2 × ' + v.dist + ') / (' + v.vth + ' + ' + v.vtd + ')'], [t, 'seconds'])]};
      }}
  };
  return {configs: CFG, fmt: G};
})();
