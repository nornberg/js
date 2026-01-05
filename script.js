"use strict";

import * as lowlevel from "./lowlevel.js";
import * as graphics from "./graphics.js";

function setup() {
  lowlevel.setTile(0, [
    0,0,0,0,0,0,0,0,
    0,1,1,1,1,1,1,0,
    0,1,2,2,2,2,1,0,
    0,1,2,3,3,2,1,0,
    0,1,2,3,3,2,1,0,
    0,1,2,2,2,2,1,0,
    0,1,1,1,1,1,1,0,
    0,0,0,0,0,0,0,0,
  ]);
  lowlevel.setBackgroundTile(0, 0, 0);
};

function main() {
  lowlevel.init();
  graphics.init(lowlevel);
  setup();
}

main();
