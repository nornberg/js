"use strict";

import * as lowlevel from "./lowlevel.js";
import * as graphics from "./graphics.js";

let palette = [];

let bgs = [{
  w: lowlevel.COLUMNS * 2,
  h: lowlevel.SCANLINES * 2,
  x: 0,
  y: 0,
  buffer: [],
}];

function sanityCheck(imgBuffer) {
  let bg = bgs[0];
  if (bg.x < 0) bg.x = 0;
  if (bg.x > bg.w-imgBuffer.width-1) bg.x = bg.w-imgBuffer.width-1;
  if (bg.y < 0) bg.y = 0;
  if (bg.y > bg.h-imgBuffer.height-1) bg.y = bg.h-imgBuffer.height-1;
}

function onLineStart(lineIdx, elapsed_time, imgBuffer) {
  sinWave2(bgs[0], lineIdx, elapsed_time, imgBuffer);
}

function render(imgBuffer, elapsed_time) {
  let bg = bgs[0];
  for (let y = 0; y < imgBuffer.height; y++) {
    onLineStart(y, elapsed_time, imgBuffer);
    sanityCheck(imgBuffer);
    for (let x = 0; x < imgBuffer.width; x++) {
      let xx = x + bg.x;
      let yy = y + bg.y;
      if (xx >= 0 && xx < bg.w && yy >= 0 && yy < bg.h) {
        let bidx = yy * bg.w + xx;
        let idx = 4 * (y * imgBuffer.width + x);
        imgBuffer.data[idx + 0] = palette[bg.buffer[bidx]].r;
        imgBuffer.data[idx + 1] = palette[bg.buffer[bidx]].g;
        imgBuffer.data[idx + 2] = palette[bg.buffer[bidx]].b;
      }
    }
  }
}

function setup() {
  for (let p = 0; p < 16; p++){
    palette.push({r:p*10, g:p*10, b:p*10});
  }
  palette[15] = {r:255, g:0, b:0};
  let bg = bgs[0];
  for (let y = 0; y < bg.h; y++) {
    for (let x = 0; x < bg.w; x++) {
      let bidx = y * bg.w + x;
      bg.buffer[bidx] = Math.trunc(x * y / 10.61) % 15;
      //bg.buffer[bidx] = Math.trunc(x  / 10.61) % 15;
      if (y == 0 || x == 0) {
        bg.buffer[bidx] = 15;
      } else if (y == bg.h-1 || x == bg.w-1) {
        bg.buffer[bidx] = 15;
      }
    }
  }
};

function main() {
  graphics.init(render);
  setup();
}

main();

let sin_delta2 = 0;
function sinWave2 (bg, lineIdx, elapsed_time, imgBuffer) {
  let perc = lineIdx / imgBuffer.height + sin_delta2; // percentual do circulo entre 0 e 1.
  let r = perc * 2 * Math.PI; // 2*PI é um circulo completo (360ª).
  bg.x = 100 + Math.trunc(Math.sin(r) * 50);
  if (lineIdx == 0) {
    sin_delta2 += 0.01 / elapsed_time;
    if (sin_delta2 >= 1) {
      sin_delta2 = 0;
    }
  }
}

let sin_delta = 0;
function sinWave (bg, lineIdx, elapsed_time, imgBuffer) {
  let perc = lineIdx / imgBuffer.height + sin_delta; // percentual do circulo entre 0 e 1.
  let r = perc * 2 * Math.PI; // 2*PI é um circulo completo (360ª).
  bg.x = 100 + Math.trunc(Math.sin(r) * 50);
  if (lineIdx == 0) {
    sin_delta += 0.02 / elapsed_time;
    if (sin_delta >= 1) {
      sin_delta = 0;
    }
  }
}