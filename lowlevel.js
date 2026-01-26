"use strict";

// ---- CONSTANTS ----

export const PALETTE_SIZE = 216 + 1; // índice 216 é a cor transparente.
export const TRANSP_COLOR_INDEX = 216;

export const SCREEN_WIDTH = 640;
export const SCREEN_HEIGHT = 480;
export const COLUMNS = SCREEN_WIDTH;
export const SCANLINES = SCREEN_HEIGHT;

export const TILEMAP_H_SIZE = 160;
export const TILEMAP_V_SIZE = 120;

export const OBJECTS_SIZE = 250;
export const OBJECT_H_SIZE = 1;
export const OBJECT_V_SIZE = 1;

export const GRAPHICS_SIZE = 1024;
export const GRAPHIC_H_SIZE = 8;
export const GRAPHIC_V_SIZE = 8;

export const SCREEN_CENTER_X = SCREEN_WIDTH / 2;
export const SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;

// ---- TABLES ----

export const palette = setDefaultPalette(PALETTE_SIZE);
export const background = setDefaultBackground(TILEMAP_H_SIZE, TILEMAP_V_SIZE);
export const objects = setDefaultObjects(OBJECTS_SIZE, OBJECT_H_SIZE, OBJECT_V_SIZE);
export const graphics = new Uint8Array(GRAPHICS_SIZE * GRAPHIC_H_SIZE * GRAPHIC_V_SIZE);
export let registers = {
    scrollX: 0,
    scrollY: 0,
    centerX: 0,
    centerY: 0,   
    scaleX: 1,
    scaleY: 1,
    shearX: 0,
    shearY: 0,
    angle: 0,
    solidColor: TRANSP_COLOR_INDEX,
};
export const hdma = [];

// ---- MEMORY BUFFERS ----

export const backgroundPixels = new Uint8ClampedArray(TILEMAP_H_SIZE * GRAPHIC_H_SIZE * TILEMAP_V_SIZE * GRAPHIC_V_SIZE);
export const screenPixels = new Uint8ClampedArray(SCREEN_WIDTH * SCREEN_HEIGHT);

// ---- FRAME ROUTINES ----

export let frame = function(timestamp) {};

// ---- GRAPHICS ROUTINES ----

export function setGraphic(graphicIndex, graphicData) {
    let startIdx = graphicIndex * GRAPHIC_H_SIZE * GRAPHIC_V_SIZE;
    for (let i = 0; i < GRAPHIC_H_SIZE * GRAPHIC_V_SIZE; i++) {
        graphics[startIdx + i] = graphicData[i];
    }
}

export function getGraphic(graphicIndex) {
    let graphicData = new Uint8ClampedArray(GRAPHIC_H_SIZE * GRAPHIC_V_SIZE);
    let startIdx = graphicIndex * GRAPHIC_H_SIZE * GRAPHIC_V_SIZE;
    for (let i = 0; i < GRAPHIC_H_SIZE * GRAPHIC_V_SIZE; i++) {
        graphicData[i] = graphics[startIdx + i];
    }
    return graphicData;
}

export function setGraphicPixel(graphicIdx, x, y, value) {
    let startIdx = graphicIdx * GRAPHIC_H_SIZE * GRAPHIC_V_SIZE;
    let pixelIdx = startIdx + y * GRAPHIC_H_SIZE + x;
    graphics[pixelIdx] = value;
}

// ---- BACKGROUND ROUTINES ----

export function setBackgroundTile(x, y, tileIdx) {
    if (x < 0 || x >= TILEMAP_H_SIZE || y < 0 || y >= TILEMAP_V_SIZE) {
        return false;
    }
    let idx = y * TILEMAP_H_SIZE + x;
    background.tilemap[idx] = tileIdx;
    return true;
}

export function setBackgroundTransform(tx, ty, cx, cy, sx, sy, ra) {
    background.transform.tx = tx;
    background.transform.ty = ty;
    background.transform.cx = cx;
    background.transform.cy = cy;
    background.transform.sx = sx;
    background.transform.sy = sy;
    background.transform.ra = ra;
}

// ---- HDMA ROUTINES ----

export function clearHDMA() {
    hdma = [{
        scrollX: 0,
        scrollY: 0,
        centerX: 0,
        centerY: 0,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
    }];
}

export function setHDMA(scanline, hdmaData) {
    hdma[scanline] = hdmaData;
}

// ---- INITIALIZATION ROUTINES ----

export function init(aFrameFunction) {
    frame = aFrameFunction;    
}

function setDefaultPalette(size) {
    let palette = [];
    let step = Math.cbrt(size - 1);
    let mult = 255 / (step-1);
    for (let r = 0; r < step; r++){
        for (let g = 0; g < step; g++){
            for (let b = 0; b < step; b++){
                palette.push({r: Math.trunc(r*mult), g: Math.trunc(g*mult), b: Math.trunc(b*mult)});
            }
        }
    }
    palette.push({r: 255, g: 0, b: 255}); // cor transparente
    return palette;
}

function setDefaultBackground(tilemapHSize, tilemapVSize) {
    let bg = {
        tilemapW: tilemapHSize,
        tilemapH: tilemapVSize,
        tilemap: new Uint8Array(tilemapHSize * tilemapVSize),
        transform: {
            tx: 0, // translation
            ty: 0,
            cx: 0, // center
            cy: 0,
            sx: 1, // scale
            sy: 1,
            ra: 0, // rotation angle
        },
    };
    return bg;
}

function setDefaultObjects(size, objHSize, objVSize) {
    let objects = new Uint8Array(size);
    for (let i = 0; i < size; i++){
        objects[i] = {
            tilemapW: objHSize,
            tilemapH: objVSize,
            tilemap: new Uint8Array(objHSize * objVSize),
            visible: true,
            x: 0,
            y: 0,
        };
    }
    return objects;
}
