"use strict";
 
export async function importTileMap(tileWidth, tileHeight) {
    let tileMapImage = new Image();
    tileMapImage.src = "/megaman_map_01.png";
    await tileMapImage.decode();
    return processImage(tileMapImage, tileWidth, tileHeight);
}

function processImage(tileMapImage, tileWidth, tileHeight) {
    let tileMapImageData = createTileMapImageData(tileMapImage);
    let [indexedBuffer, palette] = convertToIndexedColor(tileMapImageData);
    let [tiles, tileMap] = extractTiles(indexedBuffer, tileWidth, tileHeight, tileMapImage.width, tileMapImage.height);
    return [tileMap, tiles, palette, tileMapImage.width / tileWidth, tileMapImage.height / tileHeight];
}
    
function createTileMapImageData(tileMapImage) {
    let width = tileMapImage.width;
    let height = tileMapImage.height;
    let tileMapCanvas = new OffscreenCanvas(width, height);
    let tileMapCtx = tileMapCanvas.getContext("2d", { alpha: false, antialias: false, depth: false });
    tileMapCtx.imageSmoothingEnabled = false;
    tileMapCtx.drawImage(tileMapImage, 0, 0);
    let tileMapImageData = tileMapCtx.getImageData(0, 0, width, height);
    return tileMapImageData;
}

function convertToIndexedColor(imgData) {
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
    return [indexedBuffer, palette];
}

function extractTiles(indexedBuffer, tileWidth, tileHeight, mapWidth, mapHeight) {
    let tiles = [];
    let tileMap = [];
    for (let y = 0; y < mapHeight; y += tileHeight) {
        for (let x = 0; x < mapWidth; x += tileWidth) {
            let tile = [];
            for (let ty = 0; ty < tileHeight; ty++) {
                for (let tx = 0; tx < tileWidth; tx++) {
                    let idxSrc = ((y + ty) * mapWidth + (x + tx));
                    tile.push(indexedBuffer[idxSrc]);
                }
            }
            let tileIndex = tiles.findIndex(t => arraysEqual(t, tile));
            if (tileIndex === -1) { 
                tileIndex = tiles.length;
                tiles.push(tile);
            }
            tileMap.push(tileIndex);
        }
    }
    return [tiles, tileMap];
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}  