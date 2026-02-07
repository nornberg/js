"use strict";

// ---- CONSTANTS ----

export const PALETTE_COUNT = 6;
export const PALETTE_COLORS = 16;
export const TRANSP_COLOR_INDEX = 216;

export const SCREEN_WIDTH = 320;
export const SCREEN_HEIGHT = 240;
export const COLUMNS = SCREEN_WIDTH;
export const SCANLINES = SCREEN_HEIGHT;

export const OBJECTS_SIZE = 8 * 8; // OAM com 64 objetos
export const OBJECT_H_SIZE = 1;
export const OBJECT_V_SIZE = 1;

export const GRAPHICS_SIZE = 16 * 20; // pattern table com 320 gráficos
export const GRAPHIC_H_SIZE = 8;
export const GRAPHIC_V_SIZE = 8;

export const TILEMAP_H_SIZE = SCREEN_WIDTH / GRAPHIC_H_SIZE * 2;
export const TILEMAP_V_SIZE = SCREEN_HEIGHT / GRAPHIC_V_SIZE * 2;

export const SCREEN_CENTER_X = SCREEN_WIDTH / 2;
export const SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;

// ---- TABLES ----

export const palette = setDefaultPalette();
export const palettes = setDefaultPalettes();
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

// ---- PALETTE ROUTINES ----

export function setPalette(palIndex, paletteData) {
    palettes[palIndex] = paletteData;
}

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

export function init(aFrameFunction = frame) {
    frame = aFrameFunction;    
}

function setDefaultPalette() {
    let dark = 0.4;
    let bright = 1.0;
    let basePal = [
        { r: 0, g: 0, b: 0 },
        { r: dark, g: 0, b: 0 },
        { r: 0, g: dark, b: 0 },
        { r: 0, g: 0, b: dark },
        { r: dark, g: dark, b: 0 },
        { r: dark, g: 0, b: dark },
        { r: 0, g: dark, b: dark },
        { r: dark, g: dark, b: dark },
        { r: bright/2, g: bright/2, b: bright/2 },
        { r: bright, g: 0, b: 0 },
        { r: 0, g: bright, b: 0 },
        { r: 0, g: 0, b: bright },
        { r: bright, g: bright, b: 0 },
        { r: bright, g: 0, b: bright },
        { r: 0, g: bright, b: bright },
        { r: bright, g: bright, b: bright },
    ];
    let palette = [];
    for (let p = PALETTE_COUNT-2; p >= 0; p--) {
        for (let c = 0; c < PALETTE_COLORS; c++) {
            palette.push({r: basePal[c].r * (p+1) * 51, g: 51, b: 50});
        }
    }
    for (let c = 0; c < PALETTE_COLORS; c++) {
        palette.push({r: c*17, g: c*17, b: c*17});
    }
    return palette;
}

function setDefaultPalettes() {
    let dark = 0.4;
    let bright = 1.0;
    let basePal = [
        { r: 0, g: 0, b: 0 },
        { r: dark, g: 0, b: 0 },
        { r: 0, g: dark, b: 0 },
        { r: 0, g: 0, b: dark },
        { r: dark, g: dark, b: 0 },
        { r: dark, g: 0, b: dark },
        { r: 0, g: dark, b: dark },
        { r: dark, g: dark, b: dark },
        { r: bright/2, g: bright/2, b: bright/2 },
        { r: bright, g: 0, b: 0 },
        { r: 0, g: bright, b: 0 },
        { r: 0, g: 0, b: bright },
        { r: bright, g: bright, b: 0 },
        { r: bright, g: 0, b: bright },
        { r: 0, g: bright, b: bright },
        { r: bright, g: bright, b: bright },
    ];
    let palettes = [];
    for (let p = PALETTE_COUNT-2; p >= 0; p--) {
        let palette = [];
        for (let c = 0; c < PALETTE_COLORS; c++) {
            palette.push({r: basePal[c].r * (p+1) * 51, g: basePal[c].g * (p+1) * 51, b: basePal[c].b * (p+1) * 51});
        }
        palettes.push(palette);
    }
    let palette = [];
    for (let c = 0; c < PALETTE_COLORS; c++) {
        palette.push({r: c*17, g: c*17, b: c*17});
    }
    palettes.push(palette);
    return palettes;
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
