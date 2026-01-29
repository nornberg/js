"use strict";

let lowlevel = null;

let canvasDebugA = null;
let canvasDebugB = null;
let ctxDebugA = null;
let ctxDebugB = null;
let imgDataDebugBackground = null;
let imgDataDebugGraphics = null;
let imgDataDebugPal = null;

export const AUTOPAUSE_NONE = 0;
export const AUTOPAUSE_ON_FRAME = 1;
export const AUTOPAUSE_ON_SCANLINE = 2;

let autoPause = AUTOPAUSE_ON_FRAME;
let paused = false;

let indexesVisible = false;

export function init(aLowlevel) {
    lowlevel = aLowlevel;    
    canvasDebugA = getCanvas("debugCanvasA", lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE);
    canvasDebugB = getCanvas("debugCanvasB", 32 * lowlevel.GRAPHIC_H_SIZE * 4, 32 * lowlevel.GRAPHIC_V_SIZE * 4 + 32 * 13);
    ctxDebugA = createContext(canvasDebugA, "lightblue");
    ctxDebugB = createContext(canvasDebugB, "gray");
    imgDataDebugBackground = createBuffer(ctxDebugA, canvasDebugA.width, canvasDebugA.height);
    imgDataDebugGraphics = createBuffer(ctxDebugB, 32 * lowlevel.GRAPHIC_H_SIZE, 32 * lowlevel.GRAPHIC_V_SIZE);
    imgDataDebugPal = createBuffer(ctxDebugB, 24, 9);
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

        renderGraphicsToImgData(lowlevel.graphics, imgDataDebugGraphics, 32);
        putImageDataScaled(ctxDebugB, imgDataDebugGraphics, 4, 0);
        renderPaletteToImgData(lowlevel.palette, imgDataDebugPal, 24);
        putImageDataScaled(ctxDebugB, imgDataDebugPal, 32, 32 * lowlevel.GRAPHIC_V_SIZE * 4 + 8);
        if (indexesVisible) {
            drawGraphicsIndexes(ctxDebugB, 32);
        }

        renderPixelsToImgData(imgDataDebugBackground, lowlevel.backgroundPixels, lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE);
        ctxDebugA.putImageData(imgDataDebugBackground, 0, 0);
        drawScreenBorder(ctxDebugA);
        
        drawDebugText(ctxDebugA);
    //}
    if (autoPause === AUTOPAUSE_ON_FRAME) {
        paused = true;
    }
}

function drawScreenBorder(ctx) {
    let cx = lowlevel.registers.centerX;
    let cy = lowlevel.registers.centerY;
    let sx = 1 / lowlevel.registers.scaleX;
    let sy = 1 / lowlevel.registers.scaleY;
    let dx = lowlevel.registers.scrollX;
    let dy = lowlevel.registers.scrollY;
    let sw = lowlevel.SCREEN_WIDTH;
    let sh = lowlevel.SCREEN_HEIGHT;
    let rad = lowlevel.registers.angle * Math.PI / 180;
    let arcSize = 5 / sx;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1 / Math.max(sx, sy);
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    ctx.scale(sx, sy);
    ctx.translate(-cx, -cy);
    ctx.beginPath();
    ctx.rect(dx-0.5, dy-0.5, sw, sh);
    ctx.moveTo(cx, cy);                         
    ctx.arc(cx, cy, arcSize, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.resetTransform();
}

function drawDebugText(ctx) {
    let debug_line_1 = `[${lowlevel.registers.scrollX}, ${lowlevel.registers.scrollY}] (${lowlevel.registers.centerX}, ${lowlevel.registers.centerY})`;
    let debug_line_2 = `${lowlevel.registers.scaleX.toFixed(0)}x${lowlevel.registers.scaleY.toFixed(0)} ${lowlevel.registers.shearX.toFixed(0)}/${lowlevel.registers.shearY.toFixed(0)}`;
    let debug_line_3 = `${lowlevel.registers.angle.toFixed(2)}º  ${paused}`;
    ctx.fillStyle = "white";
    ctx.font = "24px monospace";
    ctx.fillText(debug_line_1, 10, 500);
    ctx.fillText(debug_line_2, 10, 530);
    ctx.fillText(debug_line_3, 10, 560);
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

function renderGraphicsToImgData(graphics, imgData, graphicsPerLine) {
    for (let gIndex = 0; gIndex < lowlevel.GRAPHICS_SIZE; gIndex++) {
        let x = (gIndex % graphicsPerLine) * lowlevel.GRAPHIC_H_SIZE;
        let y = Math.floor(gIndex / graphicsPerLine) * lowlevel.GRAPHIC_V_SIZE;
        renderGraphicToImgData(gIndex, graphics, imgData, x, y);
    }
}

function renderGraphicToImgData(gIndex, graphics, imgData, destX, destY) {
    let baseIdx = gIndex * lowlevel.GRAPHIC_H_SIZE * lowlevel.GRAPHIC_V_SIZE;
    for (let gy = 0; gy < lowlevel.GRAPHIC_V_SIZE; gy++) {
        for (let gx = 0; gx < lowlevel.GRAPHIC_H_SIZE; gx++) {
            let colorIndex = graphics[baseIdx + gy * lowlevel.GRAPHIC_H_SIZE + gx];
            let bufIdx = bufferIndex(destX + gx, destY + gy, imgData.width);
            imgData.data[bufIdx + 0] = lowlevel.palette[colorIndex].r;
            imgData.data[bufIdx + 1] = lowlevel.palette[colorIndex].g;
            imgData.data[bufIdx + 2] = lowlevel.palette[colorIndex].b;
        }
    }
}

function drawGraphicsIndexes(ctx, graphicsPerLine) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    for (let gIndex = 0; gIndex < lowlevel.GRAPHICS_SIZE; gIndex++) {
        let x = (gIndex % graphicsPerLine) * lowlevel.GRAPHIC_H_SIZE * 4;
        let y = Math.floor(gIndex / graphicsPerLine) * lowlevel.GRAPHIC_V_SIZE * 4;
        ctx.fillText(gIndex.toString().padStart(3, '0'), x + 2, y + 12);
    }
}

function renderPaletteToImgData(palette, imgData, cols) {
    for (let i = 0; i < lowlevel.PALETTE_SIZE; i++) {
        let x = (i % cols);
        let y = Math.floor(i / cols);
        let bufIdx = bufferIndex(x, y, imgData.width);
        let color = palette[i];
        imgData.data[bufIdx + 0] = color.r;
        imgData.data[bufIdx + 1] = color.g;
        imgData.data[bufIdx + 2] = color.b;
    }
}

function putImageDataScaled(ctx, imgData, scale, y){
    let tmpCan1 = new OffscreenCanvas(imgData.width, imgData.height);
    let tmpCtx1 = tmpCan1.getContext("2d", { alpha: false, antialias: false, depth: false });
    tmpCtx1.imageSmoothingEnabled = false;
    tmpCtx1.fillStyle = "green";
    tmpCtx1.fillRect(0, 0, tmpCan1.width, tmpCan1.height);
    tmpCtx1.putImageData(imgData, 0, 0);
    ctx.drawImage(tmpCan1, 0, 0 , tmpCan1.width, tmpCan1.height, 0, y, tmpCan1.width * scale, tmpCan1.height * scale);
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

export function showIndexes() {
    indexesVisible = true;
}

export function hideIndexes() {
    indexesVisible = false;
}

export function isIndexesVisible() {
    return indexesVisible;
};