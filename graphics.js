"use strict";

const TEXT_SHADOW = 2;

let canvas = null;
let ctx = null;
let screenBuffer = null;
let bgBuffer = null;

let fps = 0;
let frameCount = 0;
let lastTimestampFrameCount = 0;
let lastTimestampUpdate = 0;

let lowlevel = null;

let debug_str = "DEBUG STR";

export function init(aLowlevel) {
    lowlevel = aLowlevel;
    createCanvas("canvas", lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
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
            screenBuffer.data[bufferIndex(x, y, screenBuffer.width) + 1] = 255;
        }
    }
    bgBuffer = ctx.createImageData(lowlevel.background.tilemapW * lowlevel.TILE_H_SIZE, lowlevel.background.tilemapH * lowlevel.TILE_V_SIZE);
    for (let y = 0; y < bgBuffer.height; y++) {
        for (let x = 0; x < bgBuffer.width; x++) {
            bgBuffer.data[bufferIndex(x, y, bgBuffer.width) + 3] = 255;
            bgBuffer.data[bufferIndex(x, y, bgBuffer.width) + 0] = 255;
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
    showScreenBuffer();
    showDebugText();
  }
  window.requestAnimationFrame(frame);
};

function showScreenBuffer() {
    renderBackground();
    
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, screenBuffer.width, screenBuffer.height);
    ctx.putImageData(screenBuffer, 0, 0);
    ctx.putImageData(bgBuffer, 0, 0);
}

function renderBackground() {
    let bg = lowlevel.background;
    let tiles = lowlevel.tiles;
    let palette = lowlevel.palette;
    for (let by = 0; by < bg.tilemapH; by++) {
        for (let bx = 0; bx < bg.tilemapW; bx++) {
            let tileIdx = bg.tilemap[by * bg.tilemapW + bx];
            let tile = [];
            for (let i = 0; i < lowlevel.TILE_H_SIZE * lowlevel.TILE_V_SIZE; i++) {
                tile[i] = tiles[tileIdx * lowlevel.TILE_H_SIZE * lowlevel.TILE_V_SIZE + i];
            }
            for (let ty = 0; ty < lowlevel.TILE_H_SIZE; ty++) {
                for (let tx = 0; tx < lowlevel.TILE_V_SIZE; tx++) {
                    let pixel = tile[ty * lowlevel.TILE_H_SIZE + tx];
                    let color = palette[pixel];
                    bgBuffer.data[bufferIndex(bx * lowlevel.TILE_H_SIZE + tx, by * lowlevel.TILE_V_SIZE + ty, bgBuffer.width) + 0] = color.r;
                    bgBuffer.data[bufferIndex(bx * lowlevel.TILE_H_SIZE + tx, by * lowlevel.TILE_V_SIZE + ty, bgBuffer.width) + 1] = color.g;
                    bgBuffer.data[bufferIndex(bx * lowlevel.TILE_H_SIZE + tx, by * lowlevel.TILE_V_SIZE + ty, bgBuffer.width) + 2] = color.b;
                }
            }
        }
    }
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