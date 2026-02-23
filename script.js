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

function setup() {
  setupGraphics();
  setupBackground();
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

function setupBackground() {
  lowlevel.background.tilemap.fill(3);
  lowlevel.setBackgroundTile(18, 7, 255);
  lowlevel.setBackgroundTile(19, 7, 255);
  lowlevel.setBackgroundTile(18, 8, 255);
  lowlevel.setBackgroundTile(19, 8, 255);
  lowlevel.setBackgroundTile(39, 29, 255);
  lowlevel.setBackgroundTile(79, 59, 255);
  lowlevel.setBackgroundTile(79, 1, 255);
  let k = 32;
  for(let i = 0; i < lowlevel.PALETTE_COLORS * lowlevel.PALETTE_COUNT; i++) {
    lowlevel.setBackgroundTile(1 + i % k, 1 + Math.trunc(i / k), i);
  }
  lowlevel.setBackgroundTile(18, 1, 255);
  for (let y = 0; y < lowlevel.background.tilemapH; y++) {
      lowlevel.setBackgroundTile(0, y, 255);
      lowlevel.setBackgroundTile(lowlevel.background.tilemapW - 1, y, 255);
  }
  for (let x = 0; x < lowlevel.background.tilemapW; x++) {
      lowlevel.setBackgroundTile(x, 0, 255);
      lowlevel.setBackgroundTile(x, lowlevel.background.tilemapH - 1, 255); 
  };
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
  setup();
  await importPng.importTileMap(lowlevel, graphics);
  graphics.start();
}

main();
