"use strict";

let lowlevel = null;
let canvasBg = null;
let canvasObjects = null;
let canvasTiles = null;
let ctxBg = null;
let ctxObjects = null;
let ctxTiles = null;
let bufferBg = null;
let bufferObjects = null;
let bufferTiles = null;

export function init(aLowlevel, aBufferBg, aBufferTiles) {
    lowlevel = aLowlevel;
    bufferBg = aBufferBg;
    bufferTiles = aBufferTiles;
    canvasBg = createCanvas("bgcanvas", lowlevel.TILEMAP_H_SIZE * lowlevel.TILE_H_SIZE, lowlevel.TILEMAP_V_SIZE * lowlevel.TILE_V_SIZE);
    // canvasObjects = createCanvas("objectscanvas", lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
    canvasTiles = createCanvas("tilescanvas", lowlevel.TILES_SIZE * lowlevel.TILE_H_SIZE, lowlevel.TILE_V_SIZE);
    ctxBg = createContext(canvasBg, "lightblue");
    // ctxObjects = createContext(canvasObjects, "darkgray");
    ctxTiles = createContext(canvasTiles, "greenyellow");
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
    let buffer = ctxBg.createImageData(w, h);
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
    if (timestamp - lastTimestamp >= 100) {
        lastTimestamp = timestamp;
        ctxBg.putImageData(bufferBg, 0, 0);
        ctxTiles.putImageData(bufferTiles, 0, 0);
    }
}

function bufferIndex(x, y, width) {
    return 4 * (y * width + x);
}