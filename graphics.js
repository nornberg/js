"use strict";

import * as debug_ from "./debug.js";

let canvasScreen = null;
let ctxScreen = null;

let fps = 0;
let frameCount = 0;
let lastTimestampFrameCount = 0;
let lastTimestampUpdate = 0;

let lowlevel = null;
export const debug = debug_;

export function init(canvasElementName, aLowlevel) {
    lowlevel = aLowlevel;
    createCanvasScreen(canvasElementName, lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
    debug.init(lowlevel, canvasScreen, canvasScreen);
    window.requestAnimationFrame(frame);
}

function bufferIndex(x, y, width) {
    return 4 * (y * width + x);
}

function createCanvasScreen(canvasElementName, width, height) {
    canvasScreen = document.getElementById(canvasElementName);
    canvasScreen.width = width;
    canvasScreen.height = height;
    canvasScreen.style.imageRendering = "pixelated";
    ctxScreen = canvasScreen.getContext("2d", { alpha: false, antialias: false, depth: false });
    ctxScreen.imageSmoothingEnabled = false;
}

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

function updateScreen(timestamp) {
    renderTilemapToBuffer(lowlevel.backgroundPixels, lowlevel.background);
    let imgDataLine = ctxScreen.createImageData(lowlevel.SCREEN_WIDTH, 1);
    
    let pauseCount = 0;
    let bgTransform = lowlevel.registers;
    for (let y = 0; y < lowlevel.SCANLINES; y++) {
        mapScanlineToScreen(y, lowlevel.backgroundPixels, lowlevel.screenPixels);
        copyScanlineToImgData(y, lowlevel.screenPixels, imgDataLine);
        ctxScreen.putImageData(imgDataLine, 0, y);
        //debug.scanline(y, timestamp);
        while (debug.isPaused()) {
            pauseCount++;
            if (pauseCount > 10 * 1000) {
                debug.resume();
                pauseCount = 0;
            }
        };
    }
    //debug.frame(timestamp);
    while (debug.isPaused()) {
        pauseCount++;
        if (pauseCount > 10 * 1000) {
            debug.resume();
            pauseCount = 0;
        }
    };
}

function renderTilemapToBuffer(buffer, tilemap) {
    for (let ty = 0; ty < lowlevel.TILEMAP_V_SIZE; ty++) {
        for (let tx = 0; tx < lowlevel.TILEMAP_H_SIZE; tx++) {
            let graphicIndex = tilemap.tilemap[ty * lowlevel.TILEMAP_H_SIZE + tx];
            let graphic = lowlevel.getGraphic(graphicIndex);
            renderGraphicToBuffer(buffer, graphic, tx * lowlevel.GRAPHIC_H_SIZE, ty * lowlevel.GRAPHIC_V_SIZE);
        }
    }
}

function renderGraphicToBuffer(buffer, graphic, destX, destY) {
    for (let tileY = 0; tileY < lowlevel.GRAPHIC_V_SIZE; tileY++) {
        for (let tileX = 0; tileX < lowlevel.GRAPHIC_H_SIZE; tileX++) {
            let colorIndex = graphic[tileY * lowlevel.GRAPHIC_H_SIZE + tileX];
            let pixelIndex = (destY + tileY) * (lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE) + (destX + tileX);
            buffer[pixelIndex] = colorIndex;
        }
    }
}

function mapScanlineToScreen(y, bufferBg, bufferScreen) {
    let bgTransform = lowlevel.registers;

    let theta = bgTransform.angle * Math.PI / 180;
    let cos = Math.cos(theta);
    let sin = Math.sin(theta);
    let a = bgTransform.scaleX;
    let b = bgTransform.shearY;
    let c = bgTransform.shearX;
    let d = bgTransform.scaleY;
    let h = bgTransform.scrollX / lowlevel.SCREEN_WIDTH;
    let v = bgTransform.scrollY / lowlevel.SCREEN_HEIGHT;
    
    let x0 = bgTransform.centerX / lowlevel.SCREEN_WIDTH;
    let y0 = bgTransform.centerY / lowlevel.SCREEN_HEIGHT;
    let yi = y / lowlevel.SCREEN_HEIGHT;
    for (let x = 0; x < lowlevel.SCREEN_WIDTH * 4; x++) {
        let xi = x / lowlevel.SCREEN_WIDTH;
        let xx = (yi+v-y0) * b + (xi+h-x0) / a;
        let yy = (xi+h-x0) * c + (yi+v-y0) / d;
        let xr = xx * cos - yy * sin;
        let yr = xx * sin + yy * cos;
        xx = Math.round( (xr + x0) * lowlevel.SCREEN_WIDTH);
        yy = Math.round( (yr + y0) * lowlevel.SCREEN_HEIGHT);
        if (xx >= 0 && xx < (lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE) && yy >= 0 && yy < (lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE)) {
            bufferScreen[y * lowlevel.SCREEN_WIDTH + x] = bufferBg[yy * (lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE) + xx];
        } else {
            bufferScreen[y * lowlevel.SCREEN_WIDTH + x] = lowlevel.TRANSP_COLOR_INDEX;
        }
    }
}

function copyScanlineToImgData(y, buffer, imgData) {
    for (let x = 0; x < lowlevel.SCREEN_WIDTH; x++) {
        let colorIndex = buffer[y * lowlevel.SCREEN_WIDTH + x];
        let paletteColor = lowlevel.palette[colorIndex];
        let bufferIdx = bufferIndex(x, 0, lowlevel.SCREEN_WIDTH);
        imgData.data[bufferIdx + 0] = paletteColor.r;
        imgData.data[bufferIdx + 1] = paletteColor.g;
        imgData.data[bufferIdx + 2] = paletteColor.b;
        imgData.data[bufferIdx + 3] = 255;
    }
}

function showDebugText() {
    ctxScreen.textBaseline = "top";
    ctxScreen.font = "20px monospace";
    let s1 = "TESTE. " + (Math.random()*1000).toFixed(0);
    let s2 = fps + ' fps';
    ctxScreen.fillStyle = "blue";
    ctxScreen.fillRect(10, 10, ctxScreen.measureText(s1).width, parseInt(ctxScreen.font, 10));
    ctxScreen.fillRect(canvasScreen.width - ctxScreen.measureText(s2).width - 10, 10, ctxScreen.measureText(s2).width, parseInt(ctxScreen.font, 10));
    ctxScreen.fillStyle = "white";
    ctxScreen.fillText(s1, 10, 10);
    ctxScreen.fillText(s2, canvasScreen.width - ctxScreen.measureText(s2).width - 10, 10);
}
