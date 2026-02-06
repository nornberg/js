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
  graphics.setDebugText(`Logic fps: ${fps}`);

  lowlevel.setBackgroundTile(pos.x, pos.y, 0);
  lowlevel.setBackgroundTile(pos.x+1, pos.y, 0);
  lowlevel.setBackgroundTile(pos.x, pos.y+1, 0);
  lowlevel.setBackgroundTile(pos.x+1, pos.y+1, 0);
  pos.x = pos.x + direction;
  if (pos.x <= 5 || pos.x >= 60) {
    direction = -direction;
  }
  lowlevel.setBackgroundTile(pos.x, pos.y, 255);
  lowlevel.setBackgroundTile(pos.x+1, pos.y, 255);
  lowlevel.setBackgroundTile(pos.x, pos.y+1, 255);
  lowlevel.setBackgroundTile(pos.x+1, pos.y+1, 255);
  
  lowlevel.hdma[0].angle = (currentTimestamp / 50) % 360;
}

function setupGraphics() {
  for (let y = 0; y < lowlevel.GRAPHICS_SIZE / 16; y++) {
    for(let x = 0; x < 16; x++) {
      let c = (x % lowlevel.PALETTE_COUNT) * lowlevel.PALETTE_COLORS + (y % lowlevel.PALETTE_COLORS);
      lowlevel.setGraphic(y * 16 + x, [
        c,c,c,c,c,c,c,c,
        c,c,c,c,c,c,c,c,
        c,c,c,c,c,c,c,c,
        c,c,c,c,c,c,c,c,
        c,c,c,c,c,c,c,c,
        c,c,c,c,c,c,c,c,
        c,c,c,c,c,c,c,c,
        c,c,c,c,c,c,c,c,
      ]);
    }
  }
  // TODO: trocar todos gráficos para cores entre 0 e 15, para caber em uma paleta.
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
  lowlevel.background.tilemap.fill(10);
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
  lowlevel.setHDMA(0,
  {
      scrollX: 0,
      scrollY: 0,
      centerX: 18 * 8 + 4,
      centerY: 8 + 4,
      scaleX: 1,
      scaleY: 1,
      shearX: 0,
      shearY: 0,
      angle: 0,
  });
  for (let y = 1; y < lowlevel.SCANLINES; y++) {
    let k = y / (lowlevel.SCANLINES - 1);
      lowlevel.setHDMA(y,
        {
            scaleX: 1 + k * 17,
            scaleY: 1 + k * 17,            
        });
  }
  graphics.debug.setAutoPause(graphics.debug.AUTOPAUSE_ON_FRAME);
}

function setupKeys() {
  window.onkeydown = function(e) {
    let shiftDown = e.shiftKey; 
    let ctrlKey = e.ctrlKey;
    let field = shiftDown ? "center" : ctrlKey ? "shear" : "scroll";

    if (e.key === "ArrowUp") {
      lowlevel.registers[field + "Y"] -= 1;
    } else if (e.key === "ArrowDown") {
      lowlevel.registers[field + "Y"] += 1;
    } else if (e.key === "ArrowLeft") {
      lowlevel.registers[field + "X"] -= 1;
    } else if (e.key === "ArrowRight") {
      lowlevel.registers[field + "X"] += 1;
    } else if (e.key === "PageUp") {
      if (shiftDown) {
        lowlevel.registers.angle += 1;
      } else {
        lowlevel.registers.scaleX *= 0.9;
        lowlevel.registers.scaleY *= 0.9;
      }
    } else if (e.key === "PageDown") {
      if (shiftDown) {
        lowlevel.registers.angle -= 1;
      } else {
        lowlevel.registers.scaleX *= 1.1;
        lowlevel.registers.scaleY *= 1.1;
      }
    } else if (e.key === " ") { 
      graphics.debug.pause();
    } else if (e.key === "d") {
      if (!graphics.debug.isActive()) { 
        graphics.debug.activate();
      } else {
        graphics.debug.deactivate();
      }
    } else if (e.key === "F11") {
      graphics.debug.deactivate();
      toggleFullscreen("gamecanvas");
    } else if (e.key === "i") {
      graphics.debug.cycleIndexesVisibility();
    } else return true;
    return false;
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

function main() {
  lowlevel.init(frame);
  graphics.init("gamecanvas", lowlevel);
  setup();
  importPng.importTileMap(graphics.ctxScreen);
  //graphics.start();
}

main();
