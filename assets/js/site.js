(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggle = document.querySelector(".theme-toggle");
  var layoutOptions = document.querySelectorAll("[data-layout-option]");

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", theme === "dark" ? "#0b1120" : "#eef1f5");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  function setLayout(layout) {
    root.setAttribute("data-layout", layout);
    localStorage.setItem("layout", layout);
    layoutOptions.forEach(function (option) {
      var active = option.dataset.layoutOption === layout;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  setLayout(root.getAttribute("data-layout") === "list" ? "list" : "grid");
  layoutOptions.forEach(function (option) {
    option.addEventListener("click", function () {
      setLayout(option.dataset.layoutOption);
    });
  });

  document.querySelectorAll(".copy-shortlink").forEach(function (button) {
    var originalLabel = button.getAttribute("aria-label");

    button.addEventListener("click", function () {
      var shortUrl = new URL(button.dataset.copyPath, window.location.origin).href;
      var label = button.querySelector(".copy-label");
      var icon = button.querySelector(".copy-icon");

      navigator.clipboard.writeText(shortUrl).then(function () {
        button.classList.add("is-copied");
        button.setAttribute("aria-label", "Shortlink copied");
        label.textContent = "Copied";
        icon.textContent = "✓";
        window.setTimeout(function () {
          button.classList.remove("is-copied");
          button.setAttribute("aria-label", originalLabel);
          label.textContent = "Copy";
          icon.textContent = "⧉";
        }, 1800);
      });
    });
  });
}());
