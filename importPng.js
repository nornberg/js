"use strict";
 
export function importTileMap(lowlevel, graphics) {
    let ctx = graphics.ctxScreen;
    let tileMapCanvas = null;
    let tileMapCtx = null;
    let tileMapImage = new Image();
    tileMapImage.onload = function() {
        let width = tileMapImage.width;
        let height = tileMapImage.height;
        tileMapCanvas = new OffscreenCanvas(width, height);
        tileMapCtx = tileMapCanvas.getContext("2d", { alpha: false, antialias: false, depth: false });
        tileMapCtx.imageSmoothingEnabled = false;
        let imgDataReduced = tileMapCtx.createImageData(width, height);

        tileMapCtx.drawImage(tileMapImage, 0, 0);
        let imgDataSrc = tileMapCtx.getImageData(0, 0, width, height);
        imgDataReduced.data.fill(255);

        let palette = [];
        let indexedBuffer = [];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let idxSrc = (y * width + x) * 4;
                let r = imgDataSrc.data[idxSrc + 0];
                let g = imgDataSrc.data[idxSrc + 1];
                let b = imgDataSrc.data[idxSrc + 2];
                
                let colorIdx = palette.findIndex(c => c.r === r && c.g === g && c.b === b);
                if (colorIdx === -1) {
                    colorIdx = palette.push({r, g, b}) - 1;
                }
                indexedBuffer.push(colorIdx);
            }
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let colorIdx = indexedBuffer[y * width + x];
                let r = palette[colorIdx].r;
                let g = palette[colorIdx].g;
                let b = palette[colorIdx].b;
                
                let idxSrc = (y * width + x) * 4;
                imgDataReduced.data[idxSrc + 0] = r;
                imgDataReduced.data[idxSrc + 1] = g;
                imgDataReduced.data[idxSrc + 2] = b;
            }
        }
        ctx.putImageData(imgDataReduced, 0, 0);
        graphics.setDebugText(`Imported tile map with ${palette.length} colors.`);
        graphics.showDebugText();

        while (palette.length < lowlevel.PALETTE_COLORS) {
            palette.push({r: 0, g: 0, b: 0});
        }
        lowlevel.setPalette(0, palette);
    }
    tileMapImage.src = "/megaman_map_01.png";
 }