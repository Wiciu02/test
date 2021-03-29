const socket = io();

let mousePressed = false;
let lastPos = null;
let drawColor = "black";
let lineWidth = 5;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

createPalette();

function createPalette() {
    const COLORS = [
        "black",
        "gray",
        "silver",
        "white",
        "lightblue",
        "cyan",
        "blue",
        "darkblue",
        "purple",
        "magenta",
        "red",
        "orange",
        "yellow",
        "lime",
        "green",
        "olive",
        "brown",
        "maroon",
    ];
    const palette = document.getElementById("palette");
    COLORS.forEach((colorName) => {
        const colorElement = document.createElement("div");
        colorElement.classList.add("colorSquare");
        colorElement.style.backgroundColor = colorName;
        palette.appendChild(colorElement);
    });
}

canvas.addEventListener("touchstart", function (e) {
    mousePos = getTouchPos(canvas, e);
var touch = e.touches[0];
var mouseEvent = new MouseEvent("mousedown", {
clientX: touch.clientX,
clientY: touch.clientY
});
canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchend", function (e) {
var mouseEvent = new MouseEvent("mouseup", {});
canvas.dispatchEvent(mouseEvent);
}, false);
canvas.addEventListener("touchmove", function (e) {
var touch = e.touches[0];
var mouseEvent = new MouseEvent("mousemove", {
clientX: touch.clientX,
clientY: touch.clientY
});
canvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
var rect = canvasDom.getBoundingClientRect();
return {
x: touchEvent.touches[0].clientX - rect.left,
y: touchEvent.touches[0].clientY - rect.top
};
}
document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);
  document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);
  document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);

function draw(e) {
    const [x, y] = mousePos(e);
    if (lastPos) {
        socket.emit("drawing", drawColor, lineWidth, lastPos, [x, y]);
        lastPos = [x, y];
    } else {
        lastPos = [x, y];
        socket.emit("drawing", drawColor, lineWidth, lastPos, [x, y]);
    }
}

socket.on("drawing", (color, width, startPos, endPos) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.moveTo(...startPos);
    ctx.lineTo(...endPos);
    ctx.closePath();
    ctx.stroke();
});

function mousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        (e.clientX - rect.left) * (canvas.width / rect.width),
        (e.clientY - rect.top) * (canvas.height / rect.height),
    ];
}

canvas.addEventListener("mousedown", (e) => {
    mousePressed = true;
    draw(e);
});

canvas.addEventListener("mousemove", (e) => {
    if (mousePressed) {
        draw(e);
    }
});

canvas.addEventListener("mouseleave", () => {
    lastPos = null;
});

document.addEventListener("mouseup", (e) => {
    mousePressed = false;
    lastPos = null;
});

document.getElementById("clearBtn").addEventListener("click", () => {
    socket.emit("clearCanvas");
});

socket.on("clearCanvas", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.querySelectorAll(".colorSquare").forEach((square) => {
    square.addEventListener("click", () => {
        drawColor = square.style.backgroundColor;
        document.querySelectorAll(".widthExample").forEach((ex) => {
            ex.style.backgroundColor = drawColor;
        });
    });
});

document.querySelectorAll(".widthExample").forEach((ex) => {
    ex.addEventListener("click", () => {
        lineWidth = ex.clientWidth;
        document.querySelectorAll(".widthExample").forEach((other) => {
            other.style.opacity = 0.4;
        });
        ex.style.opacity = 1;
    });
});

socket.on("socketNumber", (number) => {
    document.getElementById("counter").innerText = number;
});
