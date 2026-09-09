(function () {
  "use strict";

  var widget = document.querySelector("[data-f1-widget]");
  if (!widget) return;

  var circuit = widget.querySelector("[data-f1-circuit]");
  var grandPrix = widget.querySelector("[data-f1-grand-prix]");
  var dates = widget.querySelector("[data-f1-dates]");
  var schedule = widget.querySelector("[data-f1-schedule]");
  var message = widget.querySelector("[data-f1-message]");
  var timeZone = "Europe/Rome";
  var dateFormatter = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", timeZone: timeZone });
  var timeFormatter = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timeZone });
  var weekdayFormatter = new Intl.DateTimeFormat("it-IT", { weekday: "short", timeZone: timeZone });

  function sessionLabel(name) {
    return { "Practice 1": "FP1", "Practice 2": "FP2", "Practice 3": "FP3", Qualifying: "Q", Race: "Gara", Sprint: "Sprint", "Sprint Qualifying": "SQ" }[name] || name;
  }

  function titleCase(value) {
    return value ? value.replace(/\b\w/g, function (letter) { return letter.toUpperCase(); }) : "";
  }

  function formatDateRange(sessions) {
    var first = new Date(Math.min.apply(null, sessions.map(function (item) { return new Date(item.date_start).getTime(); })));
    var last = new Date(Math.max.apply(null, sessions.map(function (item) { return new Date(item.date_end || item.date_start).getTime(); })));
    var firstText = dateFormatter.format(first).replace(".", "").toUpperCase();
    var lastText = dateFormatter.format(last).replace(".", "").toUpperCase();
    return firstText === lastText ? firstText : firstText + " — " + lastText;
  }

  function renderRace(race, sessions) {
    var eventSessions = sessions.filter(function (item) { return item.meeting_key === race.meeting_key && item.date_start; }).sort(function (a, b) { return new Date(a.date_start) - new Date(b.date_start); });
    var raceName = race.meeting_name || race.session_name || "Formula 1";
    var circuitName = race.circuit_short_name || race.location || race.country_name || "Next race";
    grandPrix.textContent = raceName;
    circuit.textContent = circuitName.toUpperCase();
    dates.textContent = formatDateRange(eventSessions.length ? eventSessions : [race]);
    var groups = {};
    eventSessions.forEach(function (session) {
      var day = weekdayFormatter.format(new Date(session.date_start)).slice(0, 3).toUpperCase();
      if (!groups[day]) groups[day] = [];
      groups[day].push(sessionLabel(session.session_name) + " " + timeFormatter.format(new Date(session.date_start)));
    });
    var orderedDays = ["VEN", "SAB", "DOM", "LUN", "MAR", "MER", "GIO"];
    var availableDays = orderedDays.filter(function (day) { return groups[day]; });
    if (!availableDays.length) return;
    schedule.innerHTML = availableDays.map(function (day) { return "<div class=\"f1-day\"><b>" + day + "</b><span>" + groups[day].join(" · ") + "</span></div>"; }).join("");
    schedule.hidden = false;
  }

  function fetchSeason(year) {
    return Promise.all([
      fetch("https://api.openf1.org/v1/sessions?year=" + year),
      fetch("https://api.openf1.org/v1/meetings?year=" + year)
    ]).then(function (responses) {
      if (!responses[0].ok || !responses[1].ok) throw new Error("Calendar unavailable");
      return Promise.all([responses[0].json(), responses[1].json()]).then(function (data) { return { sessions: data[0], meetings: data[1] }; });
    });
  }

  Promise.all([fetchSeason(new Date().getFullYear()).catch(function () { return { sessions: [], meetings: [] }; }), fetchSeason(new Date().getFullYear() + 1).catch(function () { return { sessions: [], meetings: [] }; })]).then(function (results) {
    var sessions = results.reduce(function (all, season) { return all.concat(season.sessions); }, []);
    var meetings = results.reduce(function (all, season) { return all.concat(season.meetings); }, []);
    var now = Date.now();
    var races = sessions.filter(function (session) { return session.session_name === "Race" && new Date(session.date_start).getTime() >= now; }).sort(function (a, b) { return new Date(a.date_start) - new Date(b.date_start); });
    if (!races.length) throw new Error("No upcoming race");
    var meeting = meetings.find(function (item) { return item.meeting_key === races[0].meeting_key; });
    if (meeting) races[0].meeting_name = meeting.meeting_name || meeting.meeting_official_name;
    renderRace(races[0], sessions);
  }).catch(function () {
    circuit.textContent = "Calendar unavailable";
    grandPrix.textContent = "Formula 1";
    dates.textContent = "";
    message.textContent = "Race schedule unavailable";
  });
}());
