"use strict";

import * as debug from "./debug.js";

const TEXT_SHADOW = 2;

let canvasScreen = null;
let ctxScreen = null;

let canvasFullBackground = null;
let ctxFullBackground = null;
let bufferFullBackground = null;

let canvasFullBackgroundRotated = null;
let ctxFullBackgroundRotated = null;
let bufferFullBackgroundRotated = null;


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
    debug.init(lowlevel, canvasFullBackgroundRotated, canvasFullBackground);
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
    ctxFullBackground = canvasFullBackground.getContext("2d", { alpha: false, antialias: false});
    ctxFullBackground.imageSmoothingEnabled = false;
//    bufferFullBackground = ctxFullBackground.createImageData(canvasFullBackground.width, canvasFullBackground.height);
//    bufferFullBackground.data.fill(0);
    
    canvasFullBackgroundRotated = new OffscreenCanvas(lowlevel.background.tilemapW * lowlevel.GRAPHIC_H_SIZE, lowlevel.background.tilemapH * lowlevel.GRAPHIC_V_SIZE);
    ctxFullBackgroundRotated = canvasFullBackgroundRotated.getContext("2d", { alpha: false, antialias: false});
    ctxFullBackgroundRotated.imageSmoothingEnabled = false;
//    bufferFullBackgroundRotated = ctxFullBackgroundRotated.createImageData(canvasFullBackgroundRotated.width/2, canvasFullBackgroundRotated.height/2);
//    bufferFullBackgroundRotated.data.fill(255);
//    ctxFullBackgroundRotated.putImageData(bufferFullBackgroundRotated, 100, 100);
//    ctxFullBackgroundRotated.fillStyle = "red";
//    ctxFullBackgroundRotated.fillRect(100, 100, 200, 200);
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
    //debug.frame(timestamp);
    updateScreen(timestamp);
    showDebugText();
  }
  window.requestAnimationFrame(frame);
};

let bgTransform = {
    scrollX: 0,
    scrollY: 0,
    centerX: 0,
    centerY: 0,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
};

function updateScreen(timestamp) {
    renderBackgroundToCanvas(lowlevel.background);
    ctxScreen.clearRect(0, 0, canvasScreen.width, canvasScreen.height);
    ctxFullBackground.strokeStyle = "red";
    ctxFullBackgroundRotated.fillStyle = "white";
    ctxFullBackgroundRotated.strokeStyle = "white";

    let k = 1;
    for (let y = 0; y < lowlevel.SCANLINES; y++) {
        if (lowlevel.hdma[y]) {
            bgTransform = {
                ...bgTransform,
                ...lowlevel.hdma[y]
            }
        }

        ctxFullBackgroundRotated.clearRect(0, 0, canvasFullBackgroundRotated.width, canvasFullBackgroundRotated.height);
        ctxFullBackgroundRotated.translate(bgTransform.centerX, bgTransform.centerY);
        ctxFullBackgroundRotated.scale(bgTransform.scaleX, bgTransform.scaleY);
        ctxFullBackgroundRotated.rotate(bgTransform.angle * Math.PI / 180);
        ctxFullBackgroundRotated.translate(-bgTransform.centerX, -bgTransform.centerY);
        ctxFullBackgroundRotated.drawImage(canvasFullBackground, 0, 0);
        ctxFullBackgroundRotated.resetTransform();
        
        ctxScreen.drawImage(canvasFullBackgroundRotated, bgTransform.scrollX, bgTransform.scrollY + y, lowlevel.SCREEN_WIDTH, 1, 0, y, lowlevel.SCREEN_WIDTH, 1);

        //ctxFullBackgroundRotated.fillRect(bgTransform.scrollX, bgTransform.scrollY + y, lowlevel.SCREEN_WIDTH, 1);
        ctxFullBackgroundRotated.strokeRect(bgTransform.scrollX, bgTransform.scrollY, lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
        ctxFullBackground.strokeRect(bgTransform.centerX-5, bgTransform.centerY-5, 10,10);
        
        debug.frame(timestamp);
        //await sleep(50);
    }
}

function renderBackgroundToCanvas(bg) {
    let buffer = ctxFullBackground.createImageData(canvasFullBackground.width, canvasFullBackground.height);
    buffer.data.fill(255);
    renderBackgroundToBuffer(buffer, bg);
    ctxFullBackground.putImageData(buffer, 0, 0);
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}