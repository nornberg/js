"use strict";

let lowlevel = null;
let bgCanvas = null;
let objectsCanvas = null;
let tilesCanvas = null;
let ctxBg = null;
let ctxObjects = null;
let ctxTiles = null;

export function init(aLowlevel) {
    lowlevel = aLowlevel;
    bgCanvas = createCanvas("bgcanvas", lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
    objectsCanvas = createCanvas("objectscanvas", lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
    tilesCanvas = createCanvas("tilescanvas", lowlevel.SCREEN_WIDTH, lowlevel.SCREEN_HEIGHT);
    ctxBg = bgCanvas.getContext("2d", { alpha: false, antialias: false, depth: false });
    ctxObjects = objectsCanvas.getContext("2d", { alpha: false, antialias: false, depth: false });
    ctxTiles = tilesCanvas.getContext("2d", { alpha: false, antialias: false, depth: false });
}

function createCanvas(canvasElementName, width, height) {
    let canvas = document.getElementById(canvasElementName);
    canvas.width = width;
    canvas.height = height;
    canvas.style.imageRendering = "pixelated";
    return canvas;
}



export function debugFrame(elapsedTime) {
    
}

