"use strict";

let lowlevel = null;
let canvasDebugBackground = null;
let canvasDebugBackgroundRotated = null;
let ctxDebugBackground = null;
let ctxDebugBackgroundRotated = null;
let imgDataDebugBackground = null;
let imgDataDebugBackgroundRotated = null;

export const AUTOPAUSE_NONE = 0;
export const AUTOPAUSE_ON_FRAME = 1;
export const AUTOPAUSE_ON_SCANLINE = 2;

let autoPause = AUTOPAUSE_ON_FRAME;
let paused = false;

export function init(aLowlevel) {
    lowlevel = aLowlevel;    
    canvasDebugBackgroundRotated = getCanvas("debugCanvasB", lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE);
    canvasDebugBackground = getCanvas("debugCanvasA", lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE);
    ctxDebugBackgroundRotated = createContext(canvasDebugBackgroundRotated, "lightGreen");
    ctxDebugBackground = createContext(canvasDebugBackground, "lightblue");
    imgDataDebugBackground = createBuffer(ctxDebugBackground, canvasDebugBackground.width, canvasDebugBackground.height);
    imgDataDebugBackgroundRotated = createBuffer(ctxDebugBackgroundRotated, canvasDebugBackgroundRotated.width, canvasDebugBackgroundRotated.height);
}

function getCanvas(canvasElementName, width, height) {
    let canvas = document.getElementById(canvasElementName);
    canvas.width = width;
    canvas.height = height;
    canvas.style.imageRendering = "pixelated";
    return canvas;
}

function createContext(canvas, color) {
    let context = canvas.getContext("2d", { alpha: false, antialias: false, depth: false });
    context.imageSmoothingEnabled = false;
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return context;
}

function createBuffer(ctx, w, h) {
    let buffer = ctx.getImageData(0, 0, w, h);
    return buffer;
}

export function scanline(y, timestamp) {
    if (autoPause === AUTOPAUSE_ON_SCANLINE) {
        paused = true;
    }
}

let lastTimestamp = 0;
export function frame(timestamp) {
    //if (timestamp - lastTimestamp >= 10) {
        lastTimestamp = timestamp;

        renderPixelsToImgData(imgDataDebugBackground, lowlevel.backgroundPixels, lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE);
        ctxDebugBackground.putImageData(imgDataDebugBackground, 0, 0);

        ctxDebugBackground.strokeStyle = "white";
        ctxDebugBackground.beginPath();
        ctxDebugBackground.rect(lowlevel.registers.scrollX-0.5, lowlevel.registers.scrollY-0.5, lowlevel.SCREEN_WIDTH,lowlevel.SCANLINES);
        ctxDebugBackground.moveTo(350+0.5,250);
        ctxDebugBackground.lineTo(400+0.5,300);
        ctxDebugBackground.stroke();


        let debug_line_1 = `[${lowlevel.registers.scrollX}, ${lowlevel.registers.scrollY}] (${lowlevel.registers.centerX}, ${lowlevel.registers.centerY})`;
        let debug_line_2 = `${lowlevel.registers.scaleX.toFixed(0)}x${lowlevel.registers.scaleY.toFixed(0)} ${lowlevel.registers.shearX.toFixed(0)}/${lowlevel.registers.shearY.toFixed(0)}`;
        let debug_line_3 = `${lowlevel.registers.angle.toFixed(2)}º  ${paused}`;
        ctxDebugBackground.fillStyle = "white";
        ctxDebugBackground.font = "24px monospace";
        ctxDebugBackground.fillText(debug_line_1, 10, 500);
        ctxDebugBackground.fillText(debug_line_2, 10, 530);
        ctxDebugBackground.fillText(debug_line_3, 10, 560);
    //}
    if (autoPause === AUTOPAUSE_ON_FRAME) {
        paused = true;
    }
}

function renderPixelsToImgData(imgData, pixels, width, height) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let colorIndex = pixels[y * width + x];
            let bufIdx = bufferIndex(x, y, imgData.width);
            imgData.data[bufIdx + 0] = lowlevel.palette[colorIndex].r;
            imgData.data[bufIdx + 1] = lowlevel.palette[colorIndex].g;
            imgData.data[bufIdx + 2] = lowlevel.palette[colorIndex].b;
        }
    }
}

function renderTilemapToImgData(buffer, tilemap) {
    for (let ty = 0; ty < lowlevel.TILEMAP_V_SIZE; ty++) {
        for (let tx = 0; tx < lowlevel.TILEMAP_H_SIZE; tx++) {
            let graphicIndex = tilemap.tilemap[ty * lowlevel.TILEMAP_H_SIZE + tx];
            let graphic = lowlevel.getGraphic(graphicIndex);
            renderGraphicToImgData(buffer, graphic, tx * lowlevel.GRAPHIC_H_SIZE, ty * lowlevel.GRAPHIC_V_SIZE);
        }
    }
}

function renderGraphicToImgData(buffer, graphic, destX, destY) {
    for (let tileY = 0; tileY < lowlevel.GRAPHIC_V_SIZE; tileY++) {
        for (let tileX = 0; tileX < lowlevel.GRAPHIC_H_SIZE; tileX++) {
            let colorIndex = graphic[tileY * lowlevel.GRAPHIC_H_SIZE + tileX];
            let pixelIndex = (destY + tileY) * lowlevel.SCREEN_WIDTH + (destX + tileX);
            buffer[pixelIndex] = colorIndex;
        }
    }
}













function bufferIndex(x, y, width) {
    return 4 * (y * width + x);
}

export function setAutoPause(mode) {
    autoPause = mode;
}

export function pause() {
    paused = true;
}

export function resume() {
    paused = false;
}

export function isPaused() {
    return paused;
}