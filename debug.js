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

let PATTERN_TABLE_COLS = 16;
let PATTERN_TABLE_ROWS = 1;
let PATTERN_TABLE_SCALE = 4;

let PAL_TABLE_COLS = 1;
let PAL_TABLE_ROWS = 1;
let PAL_TABLE_SCALE = PATTERN_TABLE_SCALE * 8;

let graphicsPaletteIndex = 0;

let autoPause = AUTOPAUSE_ON_FRAME;
let paused = false;

let active = true;
let indexesVisibility = 0;

export function init(aLowlevel) {
    lowlevel = aLowlevel;    
    PATTERN_TABLE_ROWS = Math.ceil(lowlevel.GRAPHICS_SIZE / PATTERN_TABLE_COLS);
    PAL_TABLE_COLS = lowlevel.PALETTE_COLORS;
    PAL_TABLE_ROWS = lowlevel.PALETTE_COUNT;
    canvasDebugA = getCanvas("debugCanvasA", lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE + 100);
    canvasDebugB = getCanvas("debugCanvasB", PATTERN_TABLE_COLS * lowlevel.GRAPHIC_H_SIZE * PATTERN_TABLE_SCALE, PATTERN_TABLE_ROWS * lowlevel.GRAPHIC_V_SIZE * PATTERN_TABLE_SCALE + PAL_TABLE_ROWS * lowlevel.GRAPHIC_V_SIZE * PATTERN_TABLE_SCALE + 20);
    ctxDebugA = createContext(canvasDebugA, "#555555");
    ctxDebugB = createContext(canvasDebugB, "#555555");
    imgDataDebugBackground = createBuffer(ctxDebugA, canvasDebugA.width, canvasDebugA.height);
    imgDataDebugGraphics = createBuffer(ctxDebugB, PATTERN_TABLE_COLS * lowlevel.GRAPHIC_H_SIZE, PATTERN_TABLE_ROWS * lowlevel.GRAPHIC_V_SIZE);
    imgDataDebugPal = createBuffer(ctxDebugB, PAL_TABLE_COLS * lowlevel.GRAPHIC_H_SIZE, PAL_TABLE_ROWS * lowlevel.GRAPHIC_V_SIZE);
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

export function frame(timestamp) {
    renderGraphicsToImgData(lowlevel.graphics, imgDataDebugGraphics, PATTERN_TABLE_COLS);
    putImageDataScaled(ctxDebugB, imgDataDebugGraphics, PATTERN_TABLE_SCALE, 0);
    renderPaletteToImgData(imgDataDebugPal);
    putImageDataScaled(ctxDebugB, imgDataDebugPal, PAL_TABLE_SCALE, PATTERN_TABLE_SCALE * PATTERN_TABLE_ROWS * lowlevel.GRAPHIC_V_SIZE + 10);
    
    if (indexesVisibility === 2) {
        ctxDebugB.clearRect(0, 0, canvasDebugB.width, canvasDebugB.height);
    }
    if (indexesVisibility > 0) {
        drawGraphicsIndexes(ctxDebugB, PATTERN_TABLE_COLS);
        drawPaletteIndexes(ctxDebugB, PATTERN_TABLE_SCALE * PATTERN_TABLE_ROWS * lowlevel.GRAPHIC_V_SIZE + 10);
    }

    renderPixelsToImgData(imgDataDebugBackground, lowlevel.backgroundPixels, lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE, lowlevel.palettes[lowlevel.background.paletteIndex]);
    ctxDebugA.putImageData(imgDataDebugBackground, 0, 0);
    drawScreenBorder(ctxDebugA);
    
    drawDebugText(ctxDebugA);

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
    let debug_line_2 = `${lowlevel.registers.scaleX.toFixed(3)} x ${lowlevel.registers.scaleY.toFixed(3)} ${lowlevel.registers.shearX.toFixed(0)}/${lowlevel.registers.shearY.toFixed(0)}`;
    let debug_line_3 = `${lowlevel.registers.angle.toFixed(2)}º  ${paused}`;
    ctx.fillStyle = "white";
    ctx.font = "20px monospace";
    ctx.fillText(debug_line_1, 10, 510);
    ctx.fillText(debug_line_2, 10, 535);
    ctx.fillText(debug_line_3, 10, 555);
}

function renderPixelsToImgData(imgData, pixels, width, height, palette) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let colorIndex = pixels[y * width + x];
            let bufIdx = bufferIndex(x, y, imgData.width);
            let color = palette[colorIndex];
            imgData.data[bufIdx + 0] = color.r;
            imgData.data[bufIdx + 1] = color.g;
            imgData.data[bufIdx + 2] = color.b;
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
            let color = lowlevel.palettes[graphicsPaletteIndex][colorIndex];
            imgData.data[bufIdx + 0] = color.r;
            imgData.data[bufIdx + 1] = color.g;
            imgData.data[bufIdx + 2] = color.b;
        }
    }
}

function drawGraphicsIndexes(ctx, graphicsPerLine) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    for (let gIndex = 0; gIndex < lowlevel.GRAPHICS_SIZE; gIndex++) {
        let x = (gIndex % graphicsPerLine) * lowlevel.GRAPHIC_H_SIZE * PATTERN_TABLE_SCALE;
        let y = Math.floor(gIndex / graphicsPerLine) * lowlevel.GRAPHIC_V_SIZE * PATTERN_TABLE_SCALE;
        ctx.fillText(gIndex.toString().padStart(3, '0'), x + 2, y + 12);
        ctx.strokeRect(x, y, lowlevel.GRAPHIC_H_SIZE * PATTERN_TABLE_SCALE, lowlevel.GRAPHIC_V_SIZE * PATTERN_TABLE_SCALE);
    }
}

function drawPaletteIndexes(ctx, yy) {
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    for (let p = 0; p < lowlevel.PALETTE_COUNT; p++) {
        for (let c = 0; c < lowlevel.PALETTE_COLORS; c++) {
            let x = c * lowlevel.GRAPHIC_H_SIZE * PATTERN_TABLE_SCALE;
            let y = yy + p * lowlevel.GRAPHIC_V_SIZE * PATTERN_TABLE_SCALE;
            ctx.fillText((p*lowlevel.PALETTE_COLORS+c).toString().padStart(3, '0'), x + 2, y + 24);
            if (c === 0) {
                ctx.fillText(p, x + 2, y + 12);
            }
        }
    }
}

function renderPaletteToImgData(imgData) {
    for (let p = 0; p < lowlevel.PALETTE_COUNT; p++) {
        for (let c = 0; c < lowlevel.PALETTE_COLORS; c++) {
            let bufIdx = bufferIndex(c, p, imgData.width);
            let color = lowlevel.palettes[p][c];
            imgData.data[bufIdx + 0] = color.r;
            imgData.data[bufIdx + 1] = color.g;
            imgData.data[bufIdx + 2] = color.b;
        }
    }
}

function putImageDataScaled(ctx, imgData, scale, y) {
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

export function cycleIndexesVisibility() {
    indexesVisibility = (indexesVisibility + 1) % 3;
}

export function activate() {
    active = true;
}

export function deactivate() {
    active = false;
}

export function isActive() {
    return active;
}

export function cycleGraphicsPalette() {
    graphicsPaletteIndex = (graphicsPaletteIndex + 1) % lowlevel.PALETTE_COUNT;
}