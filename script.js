"use strict";

import * as lowlevel from "./lowlevel.js";
import * as graphics from "./graphics.js";
import * as importPng from "./importPng.js";

let pos = {x: 10, y: 20};
let direction = 1;

let frameCount = 0;
let fps = 0;
let lastFrameCountTimestamp = 0;
let currentTimestamp = performance.now();

let bgSave = [];

async function setup() {
  setupGraphics();
  await setupBackground();
  setupOther();
  setupKeys();
}

function frame() {
  currentTimestamp = performance.now();
  
  frameCount++;
  let deltaFromLastFrameCount = currentTimestamp - lastFrameCountTimestamp;
  if (deltaFromLastFrameCount >= 1000){
    fps = frameCount;
    lastFrameCountTimestamp = currentTimestamp;
    frameCount = 0;
  }
  //graphics.setDebugText(`Logic fps: ${fps}`);

  if (bgSave.length > 1) {
    lowlevel.setBackgroundTile(pos.x, pos.y, bgSave[0]);
    lowlevel.setBackgroundTile(pos.x+1, pos.y, bgSave[1]);
    lowlevel.setBackgroundTile(pos.x, pos.y+1, bgSave[2]);
    lowlevel.setBackgroundTile(pos.x+1, pos.y+1, bgSave[3]);
  }
  pos.x = pos.x + direction;
  if (pos.x <= 5 || pos.x >= 60) {
    direction = -direction;
  }
  bgSave = [
    lowlevel.getBackgroundTile(pos.x, pos.y),
    lowlevel.getBackgroundTile(pos.x+1, pos.y),
    lowlevel.getBackgroundTile(pos.x, pos.y+1),
    lowlevel.getBackgroundTile(pos.x+1, pos.y+1),
  ]
  lowlevel.setBackgroundTile(pos.x, pos.y, 255);
  lowlevel.setBackgroundTile(pos.x+1, pos.y, 255);
  lowlevel.setBackgroundTile(pos.x, pos.y+1, 255);
  lowlevel.setBackgroundTile(pos.x+1, pos.y+1, 255);
}

function setupGraphics() {
  lowlevel.setGraphic(255, [
    1, 2, 2, 2, 2, 2, 2, 2,
    1, 3, 3, 3, 3, 3, 3, 8,
    1, 3,10,10,10,10, 3, 8,
    8, 3,10,11,11,10, 3, 8,
    8, 3,10,11,11,10, 3, 8,
    8, 3,10,10,10,10, 3, 8,
    8, 3, 3, 3, 3, 3, 3, 8,
    8, 8, 8, 8, 8, 8, 8, 8,
  ]);
}

async function setupBackground() {
  let [tileMap, tiles, palette, tileMapWidth, tileMapHeight] = await importPng.importTileMap(lowlevel.GRAPHIC_H_SIZE, lowlevel.GRAPHIC_V_SIZE);
  
  while (palette.length < lowlevel.PALETTE_COLORS) {
    palette.push({r: 0, g: 0, b: 0});
  }
  if (palette.length > lowlevel.PALETTE_COLORS) {
    palette = palette.slice(0, lowlevel.PALETTE_COLORS);
  }
  lowlevel.setPalette(0, palette);
  
  if (tiles.length > lowlevel.GRAPHICS_SIZE) {
    tiles = tiles.slice(0, lowlevel.GRAPHICS_SIZE);
  }
  tiles.forEach((tile, index) => {
    lowlevel.setGraphic(index, tile);
  });
  
  for (let my = 0; my < lowlevel.TILEMAP_V_SIZE; my++) {
      for (let mx = 0; mx < lowlevel.TILEMAP_H_SIZE; mx++) {
          let tileIndex = tileMap[my * tileMapWidth + mx];
          lowlevel.setBackgroundTile(mx, my, tileIndex);
      }
  }
  
  graphics.setDebugText(`Imported tile map with ${tiles.length} tiles and ${palette.length} colors.`);
  graphics.showDebugText();
}

function setupOther() {
  graphics.debug.setAutoPause(graphics.debug.AUTOPAUSE_ON_FRAME);
}

function setupKeys() {
  window.onkeydown = function(e) {
    if (e.key === "F11") {
      graphics.debug.deactivate();
      toggleFullscreen("gamecanvas");
    } else return graphics.debug.onKeydown(e);
  };
}

function toggleFullscreen(elementName) {
    var elem = document.documentElement; // Makes the entire page content fullscreen
    elem = document.getElementById(elementName);

    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        // If already in fullscreen, exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    } else {
        // Otherwise, request fullscreen
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    }
}

async function main() {
  lowlevel.init(frame);
  graphics.init("gamecanvas", lowlevel);
  await setup();
  graphics.start();
}

main();
