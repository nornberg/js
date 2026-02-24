"use strict";

import * as lowlevel from "./lowlevel.js";
import * as graphics from "./graphics.js";
import * as importPng from "./importPng.js";

let cameraPos = {x: 0, y: 0};
let direction = 1;

let frameCount = 0;
let fps = 0;
let lastFrameCountTimestamp = 0;
let currentTimestamp = performance.now();

let inputBuffer = {
  up: false,
  down: false,
  left: false,
  right: false,
}
let inputAxis = {
  x: 0,
  y: 0,
}

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
  
  poolInput();
  if (inputAxis.x !== 0) {
    cameraPos.x += inputAxis.x;
    graphics.setDebugText(`camera: (${cameraPos.x}, ${cameraPos.y})`);
  }
  if (inputAxis.y !== 0) {
    cameraPos.y += inputAxis.y;
    graphics.setDebugText(`camera: (${cameraPos.x}, ${cameraPos.y})`);
  }

  lowlevel.registers.scrollX = cameraPos.x;
  lowlevel.registers.scrollY = cameraPos.y;
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
    } else if (e.key === "ArrowUp") {
      inputBuffer.up = true;
    } else if (e.key === "ArrowDown") {
      inputBuffer.down = true;
    } else if (e.key === "ArrowLeft") {
      inputBuffer.left = true;
    } else if (e.key === "ArrowRight") {
      inputBuffer.right = true;
    } else return graphics.debug.onKeydown(e);
  };
  window.onkeyup = function(e) {
    if (e.key === "ArrowUp") {
      inputBuffer.up = false;
    } else if (e.key === "ArrowDown") {
      inputBuffer.down = false;
    } else if (e.key === "ArrowLeft") {
      inputBuffer.left = false;
    } else if (e.key === "ArrowRight") {
      inputBuffer.right = false;
    };
  }
}

function poolInput() {
  inputAxis.x = (inputBuffer.right ? 1 : 0) - (inputBuffer.left ? 1 : 0);
  inputAxis.y = (inputBuffer.down ? 1 : 0) - (inputBuffer.up ? 1 : 0);
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
