var vid = document.getElementById("vid");
var c = document.getElementById("c");
var clearButton = document.getElementById("clear");
var themeToggle = document.getElementById("theme-toggle");
var ctx = c.getContext("2d");
var arr = [];
var cur = [];
var shift = false;
var draw = false;
var sx = null;
var sy = null;
var theme = "dark";
var themeColors = {
  dark: {
    overlay: "rgba(10, 6, 2, 0.85)",
    ink: "#FFC5D3",
    connector: "rgba(255, 197, 211, 0.3)",
    landmark: "#FFFFFF",
    pointerActive: "#FFFFFF",
    pointerIdle: "rgba(255, 197, 211, 0.4)",
  },
  light: {
    overlay: "rgba(255, 248, 242, 0.82)",
    ink: "#B4235A",
    connector: "rgba(180, 35, 90, 0.32)",
    landmark: "#7A163B",
    pointerActive: "#7A163B",
    pointerIdle: "rgba(180, 35, 90, 0.4)",
  },
};

function applyTheme(nextTheme) {
  theme = nextTheme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "light"));
  themeToggle.textContent = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  themeToggle.setAttribute("aria-label", themeToggle.textContent);
}

function toggleTheme() {
  applyTheme(theme === "dark" ? "light" : "dark");
}

applyTheme("dark");
themeToggle.onclick = toggleTheme;

function clearCanvas() {
  arr = [];
  cur = [];
  draw = false;
  sx = null;
  sy = null;
  ctx.clearRect(0, 0, c.width, c.height);
}

window.onkeydown = function (e) {
  if (e.key == "Shift") shift = true;
  if (e.code == "Space") clearCanvas();
};

clearButton.onclick = clearCanvas;

window.onkeyup = function (e) {
  if (e.key == "Shift") shift = false;
};

function run(res) {
  var colors = themeColors[theme];
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  ctx.drawImage(res.image, 0, 0, c.width, c.height);
  ctx.fillStyle = colors.overlay;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.shadowColor = colors.ink;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (var i = 0; i < arr.length; i++) {
    ctx.beginPath();
    for (var j = 0; j < arr[i].length; j++) {
      if (j == 0) ctx.moveTo(arr[i][j].x, arr[i][j].y);
      else ctx.lineTo(arr[i][j].x, arr[i][j].y);
    }
    ctx.stroke();
  }

  if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
    var lm = res.multiHandLandmarks[0];
    drawConnectors(ctx, lm, HAND_CONNECTIONS, {
      color: colors.connector,
      lineWidth: 2,
    });
    drawLandmarks(ctx, lm, { color: colors.landmark, lineWidth: 1, radius: 2 });

    var ind = lm[8];
    var rx = ind.x * c.width;
    var ry = ind.y * c.height;

    if (sx == null) {
      sx = rx;
      sy = ry;
    } else {
      sx += (rx - sx) * 0.45;
      sy += (ry - sy) * 0.45;
    }

    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, 2 * Math.PI);
    if (shift) {
      ctx.fillStyle = colors.pointerActive;
    } else {
      ctx.fillStyle = colors.pointerIdle;
    }
    ctx.fill();

    if (shift) {
      if (!draw) {
        draw = true;
        cur = [];
        arr.push(cur);
      }
      cur.push({ x: sx, y: sy });
    } else {
      draw = false;
    }
  } else {
    draw = false;
    sx = null;
  }
}

var h = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  },
});

h.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

h.onResults(run);

var cam = new Camera(vid, {
  onFrame: async () => {
    await h.send({ image: vid });
  },
  width: 1280,
  height: 720,
});

cam.start();
