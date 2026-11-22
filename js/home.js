/*
 * AviaCalc | Home screen
 * Draws the problem-type cards and the Capacities sub-menu.
 * Author: Turgunov J (Student ID AE18097)
 */

(function () {
  var items = [
    ["Unit conversions", "Convert speed, distance, weight, and fuel units.", "#2F5BFF", "", "M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"],
    ["Runway length", "Find the runway length an aircraft needs.", "#FFC933", "#0B1B3F", "M9 3h6l4 18H5zM12 6v2M12 11v3M12 17v4"],
    ["Taxiway curves", "Work out the geometry of taxiway turns.", "#F2553E", "", "M5 21v-6a6 6 0 0 1 6-6h8M16 5l4 4-4 4"],
    ["Capacities", "Gate capacity and terminal capacity.", "#10A57C", "", "M5 21V11M12 21V4M19 21v-6M3 21h18"],
    ["Operation time", "Find how long an aircraft operation takes.", "#8B5CF6", "", "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2"]
  ];
  var caps = [
    ["Gate capacity", "Find how many aircraft a gate can serve.", "#10A57C", "", "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"],
    ["Terminal capacity", "Find how many passengers a terminal can handle.", "#0B8FD0", "", "M4 21V8l8-5 8 5v13M9 21v-6h6v6M3 21h18"]
  ];
  var chev = '<svg class="i chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  var home = ["Choose a problem type", "Each calculator asks for your values and shows the answer."];
  function show(list, title, sub, isSub) {
    document.getElementById("h").textContent = title;
    document.getElementById("sub").textContent = sub;
    document.getElementById("back").hidden = !isSub;
    document.getElementById("note").textContent = "";
    document.getElementById("grid").innerHTML = list.map(function (t) {
    return '<li><button class="card" type="button" data-name="' + t[0] + '" style="--c:' + t[2] + (t[3] ? ';--ci:' + t[3] : '') + '">' +
      '<span class="tile"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="' + t[4] + '"/></svg></span>' +
      '<span><span class="title">' + t[0] + '</span><span class="desc">' + t[1] + '</span></span>' + chev + '</button></li>';
  }).join("");
  }
  show(items, home[0], home[1], false);
  document.getElementById("back").addEventListener("click", function () { show(items, home[0], home[1], false); });
  document.getElementById("grid").addEventListener("click", function (e) {
    var b = e.target.closest(".card");
    if (!b) return;
    if (b.dataset.name === "Unit conversions") { location.hash = "#unit-conversions"; return; }
    if (b.dataset.name === "Runway length") { location.hash = "#runway-length"; return; }
    var gm = {"Taxiway curves": "#taxiway-curves", "Gate capacity": "#gate-capacity", "Terminal capacity": "#terminal-capacity", "Operation time": "#operation-time"};
    if (gm[b.dataset.name]) { location.hash = gm[b.dataset.name]; return; }
    if (b.dataset.name === "Capacities") { show(caps, "Capacities", "Choose which capacity to calculate.", true); return; }
    document.getElementById("note").textContent = b.dataset.name + " will open here once its formulas are added.";
  });
})();
