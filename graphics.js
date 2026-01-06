"use strict";

import * as debug from "./debug.js";

const TEXT_SHADOW = 2;

let canvas = null;
let ctx = null;
let screenBuffer = null;
let bgBuffer = null;
let tilesBuffer = null;

let fps = 0;
let frameCount = 0;
let lastTimestampFrameCount = 0;
let lastTimestampUpdate = 0;

let lowlevel = null;

let debug_str = "DEBUG STR";

export function init(canvasElementName,aLowlevel) {
    lowlevel = aLowlevel;
    createCanvas(canvasElementName, lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
    createBuffers();
    debug.init(lowlevel, bgBuffer, tilesBuffer);
    window.requestAnimationFrame(frame);
}

function bufferIndex(x, y, width) {
    return 4 * (y * width + x);
}

function createCanvas(canvasElementName, width, height) {
    canvas = document.getElementById(canvasElementName);
    canvas.width = width;
    canvas.height = height;
    //canvas.style.height = "100%";
    canvas.style.imageRendering = "pixelated";
    
    ctx = canvas.getContext("2d", { alpha: false, antialias: false, depth: false });
    ctx.imageSmoothingEnabled = false;
}

function createBuffers() {
    screenBuffer = ctx.createImageData(canvas.width, canvas.height);
    bgBuffer = ctx.createImageData(lowlevel.background.tilemapW * lowlevel.TILE_H_SIZE, lowlevel.background.tilemapH * lowlevel.TILE_V_SIZE);
    bgBuffer.data.fill(255);
    tilesBuffer = ctx.createImageData(lowlevel.TILES_SIZE * lowlevel.TILE_H_SIZE, lowlevel.TILE_V_SIZE);
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
    showScreenBuffer();
    showDebugText();
  }
  window.requestAnimationFrame(frame);
};

function showScreenBuffer() {
    renderTiles();
    renderBackground();
    //ctx.putImageData(screenBuffer, 0, 0);
    //ctx.save();
    ctx.rotate(90 * Math.PI / 180);
    //bgBuffer.
    ctx.putImageData(bgBuffer, 0, 0, 0, 0, canvas.width, canvas.height);
    ctx.rotate(-90 * Math.PI / 180);
    //ctx.restore();
}

function renderBackground() {
    let bg = lowlevel.background;
    for (let by = 0; by < bg.tilemapH; by++) {
        for (let bx = 0; bx < bg.tilemapW; bx++) {
            let tileIdx = bg.tilemap[by * bg.tilemapW + bx];
            let tile = getTile(tileIdx);
            renderTile(bgBuffer, tile, bx * lowlevel.TILE_H_SIZE, by * lowlevel.TILE_V_SIZE);
        }
    }
}

function renderTiles() {
    for (let tileIdx = 0; tileIdx < lowlevel.TILES_SIZE; tileIdx++) {
        let tile = getTile(tileIdx);
        let destX = tileIdx * lowlevel.TILE_H_SIZE;
        let destY = 0;
        renderTile(tilesBuffer, tile, destX, destY);
    }
}

function getTile (tileIdx) {
    let tiles = lowlevel.tiles;
    let tile = [];
    for (let i = 0; i < lowlevel.TILE_H_SIZE * lowlevel.TILE_V_SIZE; i++) {
        tile[i] = tiles[tileIdx * lowlevel.TILE_H_SIZE * lowlevel.TILE_V_SIZE + i];
    }
    return tile;
}

function renderTile(buffer, tile, destX, destY) {
    let palette = lowlevel.palette;
    for (let ty = 0; ty < lowlevel.TILE_H_SIZE; ty++) {
        for (let tx = 0; tx < lowlevel.TILE_V_SIZE; tx++) {
            let pixel = tile[ty * lowlevel.TILE_H_SIZE + tx];
            let color = palette[pixel];
            buffer.data[bufferIndex(destX + tx, destY + ty, buffer.width) + 0] = color.r;
            buffer.data[bufferIndex(destX + tx, destY + ty, buffer.width) + 1] = color.g;
            buffer.data[bufferIndex(destX + tx, destY + ty, buffer.width) + 2] = color.b;
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