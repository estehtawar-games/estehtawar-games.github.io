// EsTehTawar: interaksi kecil di semua halaman (tanpa pustaka).
(function () {
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tombol tema siang/malam. Pilihan disimpan di browser pengunjung (kalau boleh).
  var root = document.documentElement;
  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) { return t === "dark"; }
    return !!(darkQuery && darkQuery.matches);
  }
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* mode privat: abaikan */ }
    });
  });

  // Menu ☰ di HP: panel samping. Tutup lewat ✕, latar gelap, tombol Esc, atau setelah memilih link.
  var menuBtn = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    if (!menuBtn || !menu) { return; }
    root.classList.toggle("nav-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    if (open) {
      // Fokus ke panel (bukan ke link pertama) supaya tidak ada link yang tampak terpilih.
      menu.setAttribute("tabindex", "-1");
      setTimeout(function () { menu.focus({ preventScroll: true }); }, 60);
    } else {
      menuBtn.focus({ preventScroll: true });
    }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { setMenu(!root.classList.contains("nav-open")); });
    document.querySelectorAll("[data-menu-close]").forEach(function (el) {
      el.addEventListener("click", function () { setMenu(false); });
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { if (root.classList.contains("nav-open")) { setMenu(false); } });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("nav-open")) { setMenu(false); }
    });
    // Layar dilebarkan (HP diputar / jendela desktop): pastikan panel tertutup.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760 && root.classList.contains("nav-open")) { setMenu(false); }
    });
  }

  // Tahun di kaki halaman.
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Muncul saat digulir.
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Mini-game di diorama: tap maling helm untuk mengusirnya.
  var thief = document.getElementById("thief");
  var stage = document.getElementById("diorama");
  if (thief && stage) {
    var count = 0;
    var score = document.getElementById("score");
    var hint = document.getElementById("tapHint");
    var lines = ["+Rp5 rb", "Priiit!", "+Rp8 rb", "Kabur!", "+Rp12 rb", "Mantap, Bos!"];
    thief.addEventListener("click", function () {
      count++;
      score.textContent = "Maling diusir: " + count;
      if (hint) { hint.remove(); hint = null; }

      var box = stage.getBoundingClientRect();
      var t = thief.getBoundingClientRect();
      var pop = document.createElement("span");
      pop.className = "pop";
      pop.textContent = lines[(count - 1) % lines.length];
      pop.style.left = ((t.left + t.width / 2 - box.left) / box.width * 100) + "%";
      pop.style.top = ((t.top - box.top) / box.height * 100) + "%";
      stage.appendChild(pop);
      setTimeout(function () { pop.remove(); }, 1200);

      thief.classList.add("caught");
      setTimeout(function () {
        thief.classList.remove("caught");
        // Maling berikutnya muncul di tempat lain di parkiran.
        thief.style.left = (54 + Math.random() * 18) + "%";
      }, reduceMotion ? 300 : 1400);
    });
  }

  // Galeri screenshot: tombol geser.
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var track = gallery.querySelector(".gallery-track");
    gallery.querySelectorAll("[data-dir]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = track.querySelector("figure");
        var step = card ? card.getBoundingClientRect().width + 26 : 280;
        track.scrollBy({ left: step * Number(btn.getAttribute("data-dir")), behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  });
})();
