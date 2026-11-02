// Il calendario Google viene caricato solo dopo il clic del visitatore:
// prima di quel momento il sito non contatta Google e non imposta cookie.
document.querySelectorAll("[data-calendar-load]").forEach(function (button) {
  button.addEventListener("click", function () {
    var box = button.closest("[data-calendar-src]");
    var frame = document.createElement("iframe");
    frame.src = box.getAttribute("data-calendar-src");
    frame.title = "Calendario per prenotare un appuntamento";
    frame.loading = "lazy";
    box.replaceChildren(frame);
    frame.focus();
  });
});

// Google Analytics parte solo dopo il consenso del visitatore: prima del clic
// su «Accetta» il sito non carica lo script di Google e non imposta cookie.
// La scelta resta salvata nel browser per sei mesi e si cambia dal pulsante
// «Preferenze cookie» nel footer; revocando, i cookie _ga vengono cancellati.
(function () {
  var GA_ID = "G-D27PD86YQZ";
  var KEY = "vv-consenso-statistiche";
  var SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;

  function readChoice() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && (saved.scelta === "si" || saved.scelta === "no") && Date.now() - saved.data < SIX_MONTHS) {
        return saved.scelta;
      }
    } catch (e) {}
    return null;
  }

  function saveChoice(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ scelta: choice, data: Date.now() })); } catch (e) {}
  }

  function loadAnalytics() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 60 * 60 * 24 * 395
    });
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(script);
  }

  function removeAnalyticsCookies() {
    document.cookie.split(";").forEach(function (cookie) {
      var name = cookie.split("=")[0].trim();
      if (name !== "_ga" && name.indexOf("_ga_") !== 0) return;
      document.cookie = name + "=; Max-Age=0; path=/";
      document.cookie = name + "=; Max-Age=0; path=/; domain=" + location.hostname;
      document.cookie = name + "=; Max-Age=0; path=/; domain=." + location.hostname;
    });
  }

  function showBanner() {
    if (document.querySelector(".consent")) return;
    var box = document.createElement("div");
    box.className = "consent";
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", "Consenso ai cookie di statistica");
    box.innerHTML =
      '<p>Con il tuo consenso uso Google Analytics per contare le visite e capire quali pagine sono più utili. Se rifiuti, il sito funziona lo stesso. <a href="/cookie-policy.html">Cookie policy</a></p>' +
      '<div class="actions">' +
      '<button type="button" class="btn btn--secondary btn--small" data-consent="no">Rifiuta</button>' +
      '<button type="button" class="btn btn--secondary btn--small" data-consent="si">Accetta</button>' +
      "</div>";
    box.addEventListener("click", function (event) {
      var button = event.target.closest("[data-consent]");
      if (!button) return;
      var choice = button.getAttribute("data-consent");
      saveChoice(choice);
      box.remove();
      if (choice === "si") {
        loadAnalytics();
      } else if (window.gtag) {
        window["ga-disable-" + GA_ID] = true;
        removeAnalyticsCookies();
        location.reload();
      } else {
        removeAnalyticsCookies();
      }
    });
    document.body.appendChild(box);
  }

  document.querySelectorAll("[data-consent-open]").forEach(function (item) {
    item.hidden = false;
    item.querySelector("button").addEventListener("click", showBanner);
  });

  var choice = readChoice();
  if (choice === "si") {
    loadAnalytics();
  } else {
    removeAnalyticsCookies();
    if (choice === null) showBanner();
  }
})();
