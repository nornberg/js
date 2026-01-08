"use strict";

let lowlevel = null;
let canvasDebugBackground = null;
let canvasDebugBackgroundRotated = null;
let ctxDebugBackground = null;
let ctxDebugBackgroundRotated = null;
let canvasFullBackground = null;
let canvasFullBackgroundRotated = null;

let canvasObjects = null;
let canvasTiles = null;
let ctxObjects = null;
let ctxTiles = null;
let bufferObjects = null;
let bufferTiles = null;

export function init(aLowlevel, aCanvasFullBackgroundRotated, aCanvasFullBackground) {
    lowlevel = aLowlevel;
    canvasFullBackground = aCanvasFullBackground;
    canvasFullBackgroundRotated = aCanvasFullBackgroundRotated;
    
    canvasDebugBackgroundRotated = createCanvas("bgcanvas", lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE);
    canvasDebugBackground = createCanvas("objectscanvas", lowlevel.TILEMAP_H_SIZE * lowlevel.GRAPHIC_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.GRAPHIC_V_SIZE);
    ctxDebugBackgroundRotated = createContext(canvasDebugBackgroundRotated, "lightGreen");
    ctxDebugBackground = createContext(canvasDebugBackground, "lightblue");
}

function createCanvas(canvasElementName, width, height) {
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

function createBuffer(w, h) {
    let buffer = ctxDebugBackground.createImageData(w, h);
    buffer.data.fill(255);
    for (let y = 0; y < buffer.height; y++) {
        for (let x = 0; x < buffer.width; x++) {
            buffer.data[bufferIndex(x, y, buffer.width) + 0] = 255;
            buffer.data[bufferIndex(x, y, buffer.width) + 1] = 0;
            buffer.data[bufferIndex(x, y, buffer.width) + 3] = 255;
        }
    }
    return buffer;
}

let lastTimestamp = 0;
export function frame(timestamp) {
    //if (timestamp - lastTimestamp >= 10) {
        lastTimestamp = timestamp;
        ctxDebugBackgroundRotated.drawImage(canvasFullBackgroundRotated, 0, 0);
        
        ctxDebugBackground.drawImage(canvasFullBackground, 0, 0);
        ctxDebugBackground.strokeStyle = "yellow";
        ctxDebugBackground.beginPath();
        ctxDebugBackground.rect(lowlevel.registers.scrollX, lowlevel.registers.scrollY, lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
        ctxDebugBackground.arc(lowlevel.registers.centerX, lowlevel.registers.centerY, lowlevel.GRAPHIC_H_SIZE, 0, 360);
        ctxDebugBackground.stroke();
    //}
}

function bufferIndex(x, y, width) {
    return 4 * (y * width + x);
}