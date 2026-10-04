const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadScript() {
  const documentElement = { dataset: {} };
  const themeToggle = {
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  };
  const canvas = {
    width: 640,
    height: 480,
    getContext() {
      return {
        clearRect() {},
      };
    },
  };
  const clearButton = {};
  const sandbox = {
    Camera: function Camera() {},
    Hands: function Hands() {},
    HAND_CONNECTIONS: [],
    drawConnectors() {},
    drawLandmarks() {},
    document: {
      documentElement,
      getElementById(id) {
        if (id === "c") return canvas;
        if (id === "clear") return clearButton;
        if (id === "theme-toggle") return themeToggle;
        return {};
      },
    },
    window: {
      innerHeight: 480,
      innerWidth: 640,
    },
  };
  sandbox.Hands.prototype.setOptions = function setOptions() {};
  sandbox.Hands.prototype.onResults = function onResults() {};
  sandbox.Camera.prototype.start = function start() {};
  vm.createContext(sandbox);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8"),
    sandbox,
    { filename: "script.js" },
  );
  return { documentElement, themeToggle, sandbox };
}

test("theme starts dark and announces the light-mode action", () => {
  const { documentElement, themeToggle, sandbox } = loadScript();

  assert.equal(sandbox.theme, "dark");
  assert.equal(documentElement.dataset.theme, "dark");
  assert.equal(themeToggle.textContent, "Switch to light mode");
  assert.equal(themeToggle.attributes["aria-pressed"], "false");
});

test("theme toggle switches to light mode and back to dark mode", () => {
  const { documentElement, themeToggle, sandbox } = loadScript();

  themeToggle.onclick();
  assert.equal(sandbox.theme, "light");
  assert.equal(documentElement.dataset.theme, "light");
  assert.equal(themeToggle.textContent, "Switch to dark mode");
  assert.equal(themeToggle.attributes["aria-pressed"], "true");

  themeToggle.onclick();
  assert.equal(sandbox.theme, "dark");
  assert.equal(documentElement.dataset.theme, "dark");
  assert.equal(themeToggle.textContent, "Switch to light mode");
  assert.equal(themeToggle.attributes["aria-pressed"], "false");
});
