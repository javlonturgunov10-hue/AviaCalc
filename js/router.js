/*
 * AviaCalc | Router
 * Shows the right screen for the page address (#unit-conversions, #runway-length, ...).
 * Author: Turgunov J (Student ID AE18097)
 */

(function () {
  var $ = function (id) { return document.getElementById(id); };
  var CALCULATOR_PAGES = /^#(taxiway-curves|gate-capacity|terminal-capacity|operation-time)$/;

  function route() {
    var hash = location.hash;
    var onConverter = hash === '#unit-conversions';
    var onRunway = hash === '#runway-length';
    var onCalculator = CALCULATOR_PAGES.test(hash);

    $('hv').hidden = onConverter || onRunway || onCalculator;
    $('cv').hidden = !onConverter;
    $('rw').hidden = !onRunway;
    if (onConverter || onRunway || onCalculator) $('problems').scrollIntoView();
  }

  window.addEventListener('hashchange', route);
  route();
})();
