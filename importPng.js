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
    let tiles = extractTiles(indexedBuffer, lowlevel, tileMapImage.width, tileMapImage.height);
    tiles.forEach((tile, index) => {
        lowlevel.setGraphic(index, tile);
    });

    graphics.setDebugText(`Imported tile map with ${tiles.length} tiles and ${palette.length} colors.`);
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

function extractTiles(indexedBuffer, lowlevel, mapWidth, mapHeight) {
    let tileWidth = lowlevel.GRAPHIC_H_SIZE;
    let tileHeight = lowlevel.GRAPHIC_V_SIZE;
    let tiles = [];
    for (let y = 0; y < mapHeight; y += tileHeight) {
        for (let x = 0; x < mapWidth; x += tileWidth) {
            let tile = [];
            for (let ty = 0; ty < tileHeight; ty++) {
                for (let tx = 0; tx < tileWidth; tx++) {
                    let idxSrc = ((y + ty) * mapWidth + (x + tx));
                    tile.push(indexedBuffer[idxSrc]);
                }
            }
            if (tiles.length < lowlevel.GRAPHICS_SIZE) {
                if (!tiles.some(t => arraysEqual(t, tile))) {
                    tiles.push(tile);
                }
            }
        }
    }
    return tiles;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}  