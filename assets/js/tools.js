(function () {
  "use strict";

  function componentToHex(value) {
    return Math.round(value).toString(16).padStart(2, "0");
  }

  function rgbToHex(rgb) {
    return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
  }

  function hexToRgb(value) {
    var hex = value.trim().replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map(function (part) { return part + part; }).join("");
    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
  }

  function rgbToHsv(rgb) {
    var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    var h = 0;
    if (delta) {
      if (max === r) h = 60 * (((g - b) / delta) % 6);
      else if (max === g) h = 60 * ((b - r) / delta + 2);
      else h = 60 * ((r - g) / delta + 4);
    }
    return { h: h < 0 ? h + 360 : h, s: max ? delta / max * 100 : 0, v: max * 100 };
  }

  function rgbToHsl(rgb) {
    var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    var l = (max + min) / 2, h = 0, s = 0;
    if (delta) {
      s = delta / (1 - Math.abs(2 * l - 1));
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h: h, s: s * 100, l: l * 100 };
  }

  function hslToRgb(hsl) {
    var h = hsl.h / 360, s = hsl.s / 100, l = hsl.l / 100;
    if (!s) return { r: l * 255, g: l * 255, b: l * 255 };
    var q = l < .5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    var channel = function (t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return { r: channel(h + 1 / 3) * 255, g: channel(h) * 255, b: channel(h - 1 / 3) * 255 };
  }

  function formatColor(state, format) {
    var rgb = state.rgb, hsl = rgbToHsl(rgb), hsv = rgbToHsv(rgb);
    var alpha = Math.round(state.a * 100) + "%";
    if (format === "rgb") return "rgb(" + Math.round(rgb.r) + ", " + Math.round(rgb.g) + ", " + Math.round(rgb.b) + ") / " + alpha;
    if (format === "hsl") return "hsl(" + Math.round(hsl.h) + "°, " + Math.round(hsl.s) + "%, " + Math.round(hsl.l) + "%) / " + alpha;
    if (format === "hsv") return "hsv(" + Math.round(hsv.h) + "°, " + Math.round(hsv.s) + "%, " + Math.round(hsv.v) + "%) / " + alpha;
    if (format === "cmyk") {
      var k = 1 - Math.max(rgb.r, rgb.g, rgb.b) / 255;
      if (k === 1) return "cmyk(0%, 0%, 0%, 100%)";
      return "cmyk(" + Math.round((1 - rgb.r / 255 - k) / (1 - k) * 100) + "%, " + Math.round((1 - rgb.g / 255 - k) / (1 - k) * 100) + "%, " + Math.round((1 - rgb.b / 255 - k) / (1 - k) * 100) + "%, " + Math.round(k * 100) + "%)";
    }
    if (format === "bin") return [rgb.r, rgb.g, rgb.b].map(function (channel) { return Math.round(channel).toString(2).padStart(8, "0"); }).join(" ");
    return rgbToHex(rgb).toUpperCase() + (state.a < 1 ? componentToHex(state.a * 255).toUpperCase() : "");
  }

  function setupColorTool() {
    var tool = document.querySelector(".color-tool");
    if (!tool) return;
    var state = { rgb: hexToRgb("#b21730"), a: 1 }, format = "hex";
    var hexInput = tool.querySelector("[data-color-hex]"), picker = tool.querySelector("[data-color-picker]");
    var preview = tool.querySelector("[data-color-preview]"), previewValue = tool.querySelector("[data-color-preview-value]");
    var output = tool.querySelector("[data-color-output]"), validation = tool.querySelector("[data-color-validation]");

    function render() {
      var hsl = rgbToHsl(state.rgb), value = formatColor(state, format);
      hexInput.value = rgbToHex(state.rgb).toUpperCase();
      picker.value = rgbToHex(state.rgb);
      preview.style.backgroundColor = "rgba(" + state.rgb.r + "," + state.rgb.g + "," + state.rgb.b + "," + state.a + ")";
      preview.style.color = ((state.rgb.r * 299 + state.rgb.g * 587 + state.rgb.b * 114) / 1000) > 150 ? "#111827" : "#f8fafc";
      previewValue.textContent = formatColor(state, "hex");
      output.textContent = value;
      tool.querySelector('[data-slider-value="lightness"]').textContent = Math.round(hsl.l) + "%";
      tool.querySelector('[data-slider-value="saturation"]').textContent = Math.round(hsl.s) + "%";
      tool.querySelector('[data-slider-value="alpha"]').textContent = Math.round(state.a * 100) + "%";
      tool.querySelector("[data-color-lightness]").value = hsl.l;
      tool.querySelector("[data-color-saturation]").value = hsl.s;
      tool.querySelector("[data-color-alpha]").value = state.a * 100;
      var palette = tool.querySelector("[data-shade-palette]");
      if (!palette) return;
      palette.querySelectorAll("button").forEach(function (swatch) { swatch.remove(); });
      [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach(function (weight) {
        var mix = weight <= 500 ? (500 - weight) / 450 : (weight - 500) / 400;
        var shade = weight <= 500 ? { r: state.rgb.r + (255 - state.rgb.r) * mix, g: state.rgb.g + (255 - state.rgb.g) * mix, b: state.rgb.b + (255 - state.rgb.b) * mix } : { r: state.rgb.r * (1 - mix), g: state.rgb.g * (1 - mix), b: state.rgb.b * (1 - mix) };
        var button = document.createElement("button");
        button.type = "button"; button.className = "shade-swatch"; button.style.backgroundColor = rgbToHex(shade); button.dataset.shade = rgbToHex(shade).toUpperCase(); button.setAttribute("aria-label", "Copy " + button.dataset.shade);
        button.innerHTML = "<span>" + weight + "</span><small>" + button.dataset.shade + "</small>";
        palette.appendChild(button);
      });
    }
    function setRgb(rgb) { state.rgb = rgb; validation.textContent = ""; hexInput.classList.remove("is-invalid"); render(); }
    hexInput.addEventListener("input", function () { var rgb = hexToRgb(hexInput.value); validation.textContent = rgb ? "" : "Enter a valid HEX value"; hexInput.classList.toggle("is-invalid", !rgb); if (rgb) setRgb(rgb); });
    picker.addEventListener("input", function () { setRgb(hexToRgb(picker.value)); });
    tool.querySelector("[data-color-lightness]").addEventListener("input", function (event) { state.rgb = hslToRgb({ h: rgbToHsl(state.rgb).h, s: rgbToHsl(state.rgb).s, l: Number(event.target.value) }); render(); });
    tool.querySelector("[data-color-saturation]").addEventListener("input", function (event) { var hsl = rgbToHsl(state.rgb); hsl.s = Number(event.target.value); state.rgb = hslToRgb(hsl); render(); });
    tool.querySelector("[data-color-alpha]").addEventListener("input", function (event) { state.a = Number(event.target.value) / 100; render(); });
    tool.querySelectorAll("[data-color-format]").forEach(function (tab) { tab.addEventListener("click", function () { format = tab.dataset.colorFormat; tool.querySelectorAll("[data-color-format]").forEach(function (item) { item.classList.toggle("is-active", item === tab); item.setAttribute("aria-selected", item === tab ? "true" : "false"); }); render(); }); });
    tool.addEventListener("click", function (event) { var swatch = event.target.closest(".shade-swatch"); if (swatch) copyValue(swatch.dataset.shade, swatch); });
    tool.querySelector("[data-color-copy]").addEventListener("click", function (event) { copyValue(output.textContent, event.currentTarget); });
    render();
  }

  function copyValue(value, button) {
    navigator.clipboard.writeText(value).then(function () { var original = button.innerHTML; button.classList.add("is-copied"); button.textContent = "✓ Copied"; window.setTimeout(function () { button.classList.remove("is-copied"); button.innerHTML = original; }, 1800); });
  }

  function ipToInt(ip) { return ip.split(".").reduce(function (result, octet) { return ((result << 8) | Number(octet)) >>> 0; }, 0); }
  function intToIp(value) { return [value >>> 24, value >>> 16 & 255, value >>> 8 & 255, value & 255].join("."); }
  function parseCidr(value) { var parts = value.trim().split("/"); if (parts.length !== 2 || !/^\d+$/.test(parts[1])) return null; var octets = parts[0].split("/")[0].split("."); var prefix = Number(parts[1]); if (octets.length !== 4 || prefix < 0 || prefix > 32 || octets.some(function (item) { return !/^\d{1,3}$/.test(item) || Number(item) > 255; })) return null; return { ip: ipToInt(parts[0]), prefix: prefix }; }
  function setupSipCalc() {
    var tool = document.querySelector(".sipcalc"); if (!tool) return;
    var input = tool.querySelector("[data-sip-input]"), validation = tool.querySelector("[data-sip-validation]"), values = {};
    function render() { var parsed = parseCidr(input.value); input.classList.toggle("is-invalid", Boolean(input.value) && !parsed); if (!parsed) { validation.textContent = input.value ? "Enter a valid IPv4 CIDR" : ""; tool.querySelectorAll("[data-sip]").forEach(function (item) { item.textContent = "—"; }); tool.querySelectorAll("[data-sip-copy]").forEach(function (button) { delete button.dataset.copyValue; }); return; } validation.textContent = ""; var mask = parsed.prefix === 0 ? 0 : (0xffffffff << (32 - parsed.prefix)) >>> 0, network = (parsed.ip & mask) >>> 0, broadcast = (network | (~mask >>> 0)) >>> 0, total = Math.pow(2, 32 - parsed.prefix), first = network, last = broadcast, usable = total - 2;
      if (parsed.prefix === 31) { usable = 2; } else if (parsed.prefix === 32) { first = network; last = network; usable = 1; }
      values = { network: intToIp(network) + "/" + parsed.prefix, ip: intToIp(parsed.ip), prefix: "/" + parsed.prefix, mask: intToIp(mask), wildcard: intToIp((~mask) >>> 0), broadcast: parsed.prefix === 32 ? "N/A (host route)" : intToIp(broadcast), first: intToIp(first), last: intToIp(last), total: total.toLocaleString(), usable: usable.toLocaleString() };
      tool.querySelectorAll("[data-sip]").forEach(function (item) { item.textContent = values[item.dataset.sip]; }); tool.querySelectorAll("[data-sip-copy]").forEach(function (button) { button.dataset.copyValue = values[button.dataset.sipCopy]; });
    }
    input.addEventListener("input", render); tool.addEventListener("click", function (event) { var button = event.target.closest("[data-sip-copy]"); if (button && button.dataset.copyValue) copyValue(button.dataset.copyValue, button); }); render();
  }
  setupColorTool(); setupSipCalc();
}());
