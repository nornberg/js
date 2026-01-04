"use strict";

const TEXT_SHADOW = 2;

let canvas = null;
let ctx = null;
let screenBuffer = null;

let fps = 0;
let frameCount = 0;
let lastTimestampFrameCount = 0;
let lastTimestampUpdate = 0;

let debug_str = "DEBUG STR";

let renderFunction = function() {};

export function init(aRenderFunction) {
    renderFunction = aRenderFunction;
    createCanvas("canvas", 640, 480);
    createScreenBuffer();
    window.requestAnimationFrame(frame);
}

function bufferIndex(x, y, width) {
    return 4 * (y * width + x);
}

function createCanvas(canvasElementName, width, height) {
    canvas = document.getElementById(canvasElementName);
    canvas.width = width;
    canvas.height = height;
    canvas.style.height = "100%";
    canvas.style.imageRendering = "pixelated";
    
    ctx = canvas.getContext("2d", { alpha: false, antialias: false, depth: false });
    ctx.imageSmoothingEnabled = false;
}

function createScreenBuffer() {
    screenBuffer = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < screenBuffer.height; y++) {
        for (let x = 0; x < screenBuffer.width; x++) {
            screenBuffer.data[bufferIndex(x, y, screenBuffer.width) + 3] = 255;
        }
    }
};

function frame(timestamp) {
  if (timestamp - lastTimestampFrameCount >= 1000){
    fps = frameCount;
    lastTimestampFrameCount = timestamp;
    frameCount = 0;
  }
  let elapsedTime = timestamp - lastTimestampUpdate;
  // TODO: fazer o elapsedTime ser independente da limitação de fps abaixo.
  if (elapsedTime >= 0){
    lastTimestampUpdate = timestamp;
    frameCount++;
    renderFunction(screenBuffer, elapsedTime);
    showScreenBuffer();
    showDebugText();
  }
  window.requestAnimationFrame(frame);
};

function showScreenBuffer() {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, screenBuffer.width, screenBuffer.height);
    ctx.putImageData(screenBuffer, 0, 0);
}

function showDebugText() {
    ctx.textBaseline = "top";
    ctx.font = "20px monospace";
    let s1 = "TESTE. " + (Math.random()*1000).toFixed(0);
    let s2 = fps + ' fps';
    ctx.fillStyle = "black";
    ctx.fillText(s1, 10+TEXT_SHADOW, 10+TEXT_SHADOW);
    ctx.fillText(s2, screenBuffer.width - ctx.measureText(s2).width - 10+TEXT_SHADOW, 10+TEXT_SHADOW);
    ctx.fillText(debug_str, 10+TEXT_SHADOW, 450+TEXT_SHADOW);
    ctx.fillStyle = "white";
    ctx.fillText(s1, 10, 10);
    ctx.fillText(s2, screenBuffer.width - ctx.measureText(s2).width - 10, 10);
    ctx.fillText(debug_str, 10, 450);
}