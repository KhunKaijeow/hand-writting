const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadScript() {
  const clearCalls = [];
  const documentElement = { dataset: {} };
  const context2d = {
    clearRect(...args) {
      clearCalls.push(args);
    },
  };
  const canvas = {
    width: 640,
    height: 480,
    getContext() {
      return context2d;
    },
  };
  const clearButton = {};
  const themeToggle = {
    setAttribute() {},
  };
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
  return { canvas, clearButton, clearCalls, sandbox };
}

function seedDrawingState(sandbox) {
  sandbox.arr = [{ x: 12, y: 24 }];
  sandbox.cur = [{ x: 36, y: 48 }];
  sandbox.draw = true;
  sandbox.sx = 60;
  sandbox.sy = 72;
}

test("clearCanvas resets stroke and pointer state and clears the canvas", () => {
  const { canvas, clearCalls, sandbox } = loadScript();
  seedDrawingState(sandbox);

  sandbox.clearCanvas();

  assert.equal(sandbox.arr.length, 0);
  assert.equal(sandbox.cur.length, 0);
  assert.equal(sandbox.draw, false);
  assert.equal(sandbox.sx, null);
  assert.equal(sandbox.sy, null);
  assert.deepEqual(clearCalls, [[0, 0, canvas.width, canvas.height]]);
});

test("Space shortcut uses the canvas reset behavior", () => {
  const { clearCalls, sandbox } = loadScript();
  seedDrawingState(sandbox);

  sandbox.window.onkeydown({ code: "Space" });

  assert.equal(sandbox.arr.length, 0);
  assert.equal(sandbox.cur.length, 0);
  assert.equal(sandbox.draw, false);
  assert.equal(sandbox.sx, null);
  assert.equal(sandbox.sy, null);
  assert.equal(clearCalls.length, 1);
});

test("Clear Canvas button uses the canvas reset behavior", () => {
  const { clearButton, sandbox } = loadScript();
  seedDrawingState(sandbox);

  clearButton.onclick();

  assert.equal(sandbox.arr.length, 0);
  assert.equal(sandbox.cur.length, 0);
  assert.equal(sandbox.draw, false);
  assert.equal(sandbox.sx, null);
  assert.equal(sandbox.sy, null);
});
