"use strict";
 
export function importTileMap(lowlevel, graphics) {
    let tileMapImage = new Image();
    tileMapImage.onload = function() {
        onTileMapLoad(this, lowlevel, graphics);
    }
    tileMapImage.src = "/megaman_map_01.png";
 }

 function onTileMapLoad(tileMapImage, lowlevel, graphics) {
    let [imgDataSrc, imgDataReduced] = createTileMapImageData(tileMapImage);
    let [indexedBuffer, palette] = convertToIndexedColor(imgDataSrc, lowlevel.PALETTE_COLORS);
    lowlevel.setPalette(0, palette);
    
    graphics.setDebugText(`Imported tile map with ${palette.length} colors.`);
    graphics.showDebugText();
    
    drawIndexedBufferToImageData(indexedBuffer, palette, imgDataReduced);
    graphics.ctxScreen.putImageData(imgDataReduced, 0, 0);
}
    
function createTileMapImageData(tileMapImage) {
    let width = tileMapImage.width;
    let height = tileMapImage.height;
    let tileMapCanvas = new OffscreenCanvas(width, height);
    let tileMapCtx = tileMapCanvas.getContext("2d", { alpha: false, antialias: false, depth: false });
    tileMapCtx.imageSmoothingEnabled = false;
    tileMapCtx.drawImage(tileMapImage, 0, 0);
    let imgDataOriginal = tileMapCtx.getImageData(0, 0, width, height);
    let imgDataReduced = tileMapCtx.createImageData(width, height);
    imgDataReduced.data.fill(255);
    return [imgDataOriginal, imgDataReduced];
}

function convertToIndexedColor(imgData, paletteSize) {
    let palette = [];
    let indexedBuffer = [];
    let width = imgData.width;
    let height = imgData.height;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let idxSrc = (y * width + x) * 4;
            let r = imgData.data[idxSrc + 0];
            let g = imgData.data[idxSrc + 1];
            let b = imgData.data[idxSrc + 2];
            
            let colorIdx = palette.findIndex(c => c.r === r && c.g === g && c.b === b);
            if (colorIdx === -1) {
                colorIdx = palette.push({r, g, b}) - 1;
            }
            indexedBuffer.push(colorIdx);
        }
    }
    while (palette.length < paletteSize) {
        palette.push({r: 0, g: 0, b: 0});
    }
    return [indexedBuffer, palette];
}

function drawIndexedBufferToImageData(indexedBuffer, palette, imgData) {
    let width = imgData.width;
    let height = imgData.height; 
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let colorIdx = indexedBuffer[y * width + x];
            let r = palette[colorIdx].r;
            let g = palette[colorIdx].g;
            let b = palette[colorIdx].b;
            
            let idxSrc = (y * width + x) * 4;
            imgData.data[idxSrc + 0] = r;
            imgData.data[idxSrc + 1] = g;
            imgData.data[idxSrc + 2] = b;
        }
    }
}