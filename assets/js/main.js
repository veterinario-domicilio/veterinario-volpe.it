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
