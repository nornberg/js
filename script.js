"use strict";

import * as lowlevel from "./lowlevel.js";
import * as graphics from "./graphics.js";

function setup() {
  lowlevel.setTile(250, [
    0,0,0,0,0,0,0,0,
    0,10,10,10,10,10,10,0,
    0,10,20,20,20,20,10,0,
    0,10,20,30,30,20,10,0,
    0,10,20,30,30,20,10,0,
    0,10,20,20,20,20,10,0,
    0,10,10,10,10,10,10,0,
    0,0,0,0,0,0,0,0,
  ]);
  lowlevel.setBackgroundTile(10, 10, 250);
  let k = 36;
  for(let i = 0; i < lowlevel.PALETTE_SIZE; i++){
    lowlevel.setTile(i, [
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
      i,i,i,i,i,i,i,i,
    ]);
    lowlevel.setBackgroundTile(i%k, Math.trunc(i/k), i);
  };
}

function main() {
  lowlevel.init();
  graphics.init(lowlevel);
  setup();
}

main();
