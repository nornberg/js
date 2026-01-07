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
  lowlevel.setBackgroundTile(10, 10, 250);
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
  for (let y = 0; y < lowlevel.background.tilemapH; y++) {
      lowlevel.setBackgroundTile(0, y, 250);
      lowlevel.setBackgroundTile(lowlevel.background.tilemapW - 1, y, 250);
  }
  for (let x = 0; x < lowlevel.background.tilemapW; x++) {
      lowlevel.setBackgroundTile(x, 0, 250);
      lowlevel.setBackgroundTile(x, lowlevel.background.tilemapH - 1, 250); 
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
}

function main() {
  lowlevel.init(frame);
  graphics.init("gamecanvas", lowlevel);
  setup();
}

main();
