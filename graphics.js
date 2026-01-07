"use strict";

import * as debug from "./debug.js";

const TEXT_SHADOW = 2;

let canvasScreen = null;
let ctxScreen = null;

let bufferFullBackground = null;
let canvasFullBackground = null;
let ctxFullBackground = null;

let tilesBuffer = null;


let fps = 0;
let frameCount = 0;
let lastTimestampFrameCount = 0;
let lastTimestampUpdate = 0;

let lowlevel = null;

let debug_str = "DEBUG STR";

export function init(canvasElementName,aLowlevel) {
    lowlevel = aLowlevel;
    createCanvasScreen(canvasElementName, lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
    createCanvasFullBackground();
    createGraphicsBuffer();
    debug.init(lowlevel, canvasFullBackground, tilesBuffer);
    window.requestAnimationFrame(frame);
}

function bufferIndex(x, y, width) {
    return 4 * (y * width + x);
}

function createCanvasScreen(canvasElementName, width, height) {
    canvasScreen = document.getElementById(canvasElementName);
    canvasScreen.width = width;
    canvasScreen.height = height;
    //canvas.style.height = "100%";
    canvasScreen.style.imageRendering = "pixelated";
    
    ctxScreen = canvasScreen.getContext("2d", { alpha: false, antialias: false, depth: false });
    ctxScreen.imageSmoothingEnabled = false;
}

function createCanvasFullBackground() {
    canvasFullBackground = new OffscreenCanvas(lowlevel.background.tilemapW * lowlevel.GRAPHIC_H_SIZE, lowlevel.background.tilemapH * lowlevel.GRAPHIC_V_SIZE);
    ctxFullBackground = canvasFullBackground.getContext("2d", { alpha: false, antialias: false, depth: false });
    ctxFullBackground.imageSmoothingEnabled = false;
    bufferFullBackground = ctxFullBackground.createImageData(canvasFullBackground.width, canvasFullBackground.height);
    bufferFullBackground.data.fill(255);
}

function createGraphicsBuffer() {
    tilesBuffer = ctxScreen.createImageData(lowlevel.GRAPHICS_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.GRAPHIC_V_SIZE);
    tilesBuffer.data.fill(255);
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
    lowlevel.frame(timestamp)
    debug.frame(timestamp);
    updateScreen();
    showDebugText();
  }
  window.requestAnimationFrame(frame);
};

let scrollX = 0;
let scrollDir = 1;
function updateScreen() {
    renderBackgroundToCanvas(canvasFullBackground, lowlevel.background);
    ctxScreen.clearRect(0, 0, canvasScreen.width, canvasScreen.height);
    let k = 3.1;
    for (let y = 0; y < lowlevel.SCANLINES; y++) {
        ctxScreen.translate(canvasScreen.width / 2 + scrollX, canvasScreen.height / 4);
        ctxScreen.rotate(0 * Math.PI / 180);
        //ctxScreen.scale(k, k);
        ctxScreen.drawImage(canvasFullBackground, 0, y, canvasScreen.width, 1, k, y*k, canvasScreen.width*k, k);
        ctxScreen.resetTransform();
        if (y % 8 === 0){
            //k += 0.5;
        }
    }
    scrollX += scrollDir;
    if (scrollX > 318 || scrollX < -320){
        scrollDir = -scrollDir;
    }
}

function renderBackgroundToCanvas(canvas, bg) {
    let context = canvas.getContext("2d", { alpha: false, antialias: false, depth: false });
    context.imageSmoothingEnabled = false;
    let buffer = context.createImageData(canvas.width, canvas.height);
    renderBackgroundToBuffer(buffer, bg);
    context.putImageData(buffer, 0, 0);
}
function renderBackgroundToBuffer(buffer, bg) {
    for (let ty = 0; ty < bg.tilemapH; ty++) {
        for (let tx = 0; tx < bg.tilemapW; tx++) {
            let graphicIndex = bg.tilemap[ty * bg.tilemapW + tx];
            let graphic = lowlevel.getGraphic(graphicIndex);
            renderGraphicToBuffer(buffer, graphic, tx * lowlevel.GRAPHIC_H_SIZE, ty * lowlevel.GRAPHIC_V_SIZE);
        }
    }
}

function renderGraphicToBuffer(buffer, graphic, destX, destY) {
    let palette = lowlevel.palette;
    for (let tileY = 0; tileY < lowlevel.GRAPHIC_H_SIZE; tileY++) {
        for (let tileX = 0; tileX < lowlevel.GRAPHIC_V_SIZE; tileX++) {
            let colorIndex = graphic[tileY * lowlevel.GRAPHIC_H_SIZE + tileX];
            let color = palette[colorIndex];
            let pixelIndex = bufferIndex(destX + tileX, destY + tileY, buffer.width);
            buffer.data[pixelIndex + 0] = color.r;
            buffer.data[pixelIndex + 1] = color.g;
            buffer.data[pixelIndex + 2] = color.b;
        }
    }
}

function showDebugText() {
    ctxScreen.textBaseline = "top";
    ctxScreen.font = "20px monospace";
    let s1 = "TESTE. " + (Math.random()*1000).toFixed(0);
    let s2 = fps + ' fps';
    ctxScreen.fillStyle = "black";
    ctxScreen.fillText(s1, 10+TEXT_SHADOW, 10+TEXT_SHADOW);
    ctxScreen.fillText(s2, canvasScreen.width - ctxScreen.measureText(s2).width - 10+TEXT_SHADOW, 10+TEXT_SHADOW);
    ctxScreen.fillText(debug_str, 10+TEXT_SHADOW, 450+TEXT_SHADOW);
    ctxScreen.fillStyle = "white";
    ctxScreen.fillText(s1, 10, 10);
    ctxScreen.fillText(s2, canvasScreen.width - ctxScreen.measureText(s2).width - 10, 10);
    ctxScreen.fillText(debug_str, 10, 450);
}