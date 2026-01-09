"use strict";

import * as lowlevel from "./lowlevel.js";
import * as graphics from "./graphics.js";

function setup() {
  lowlevel.setGraphic(250, [
    50,90,90,90,90,90,90,90,
    50,10,10,10,10,10,10,80,
    50,10,20,20,20,20,10,80,
    80,10,20,30,30,20,10,80,
    80,10,20,30,30,20,10,80,
    80,10,20,20,20,20,10,80,
    80,10,10,10,10,10,10,80,
    80,80,80,80,80,80,80,80,
  ]);
  lowlevel.background.tilemap.fill(10);
  lowlevel.setBackgroundTile(18, 7, 250);
  lowlevel.setBackgroundTile(19, 7, 250);
  lowlevel.setBackgroundTile(18, 8, 250);
  lowlevel.setBackgroundTile(19, 8, 250);
  lowlevel.setBackgroundTile(39, 29, 250);
  lowlevel.setBackgroundTile(79, 59, 250);
  lowlevel.setBackgroundTile(79, 1, 250);
  let k = 36;
  for(let i = 0; i < lowlevel.PALETTE_SIZE; i++) {
    lowlevel.setGraphic(i, [
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
    ]);
    lowlevel.setBackgroundTile(1 + i % k, 1 + Math.trunc(i / k), i);
  }
  lowlevel.setBackgroundTile(18, 1, 250);
  for (let y = 0; y < lowlevel.background.tilemapH; y++) {
      lowlevel.setBackgroundTile(0, y, 250);
      lowlevel.setBackgroundTile(lowlevel.background.tilemapW - 1, y, 250);
  }
  for (let x = 0; x < lowlevel.background.tilemapW; x++) {
      lowlevel.setBackgroundTile(x, 0, 250);
      lowlevel.setBackgroundTile(x, lowlevel.background.tilemapH - 1, 250); 
  };
  lowlevel.setHDMA(0,
  {
      scrollX: 0,
      scrollY: 0,
      centerX: 18 * 8 + 4,
      centerY: 8 + 4,
      scaleX: 1,
      scaleY: 1,
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
  window.onkeydown = function(e) {
    let shiftDown = e.shiftKey; 
    let field = shiftDown ? "center" : "scroll";
    console.log(shiftDown, field, e.key);

    if (e.key === "ArrowUp") {
      lowlevel.registers[field + "Y"] -= 8;
    } else if (e.key === "ArrowDown") {
      lowlevel.registers[field + "Y"] += 8;
    } else if (e.key === "ArrowLeft") {
      lowlevel.registers[field + "X"] -= 8;
    } else if (e.key === "ArrowRight") {
      lowlevel.registers[field + "X"] += 8;
    } else if (e.key === "PageUp") {
      if (shiftDown) {
        lowlevel.registers.angle += 5;
      } else {
        if (lowlevel.registers.scaleX < 1.0) {
          lowlevel.registers.scaleX += 0.1;
          lowlevel.registers.scaleY += 0.1;
        } else {
          lowlevel.registers.scaleX += 0.5;
          lowlevel.registers.scaleY += 0.5;
        }
      }
    } else if (e.key === "PageDown") {
      if (shiftDown) {
        lowlevel.registers.angle -= 5;
      } else {
        if (lowlevel.registers.scaleX <= 1.0) {
          lowlevel.registers.scaleX -= 0.1;
          lowlevel.registers.scaleY -= 0.1;
        } else {
          lowlevel.registers.scaleX -= 0.5;
          lowlevel.registers.scaleY -= 0.5;
        }
      }
    }
    return false;
  };  
}

let pos = {x: 10, y: 20};
let direction = 1;
function frame(timestamp) {
  lowlevel.setBackgroundTile(pos.x, pos.y, 10);
  lowlevel.setBackgroundTile(pos.x+1, pos.y, 10);
  lowlevel.setBackgroundTile(pos.x, pos.y+1, 10);
  lowlevel.setBackgroundTile(pos.x+1, pos.y+1, 10);
  pos.x = pos.x + direction;
  if (pos.x <= 5 || pos.x >= 60) {
    direction = -direction;
  }
  lowlevel.setBackgroundTile(pos.x, pos.y, 250);
  lowlevel.setBackgroundTile(pos.x+1, pos.y, 250);
  lowlevel.setBackgroundTile(pos.x, pos.y+1, 250);
  lowlevel.setBackgroundTile(pos.x+1, pos.y+1, 250);
  lowlevel.hdma[0].angle = (timestamp / 50) % 360;
}

function main() {
  lowlevel.init(frame);
  graphics.init("gamecanvas", lowlevel);
  setup();
}

main();
