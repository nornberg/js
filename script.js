"use strict";

const WIDTH = 640;
const HEIGHT = 480;
const TEXT_SHADOW = 2;

let imgBuffer = null;
let canvas = null;
let ctx = null;

let fps = 0;
let frame_count = 0;
let frame_time = 0;
let last_update_time = 0;

let debug_str = 'debug str';
let min_color = 20;
let max_color = -1;

let palette = [];
let buffer = [];
let bgs = [{
  w: WIDTH * 2,
  h: HEIGHT * 2,
  x: 0,
  y: 0,
  buffer: [],
}];

function rad(degree) {
  return degree * Math.PI / 180;
}

function sanityCheck(imgBuffer) {
  let bg = bgs[0];
  if (bg.x < 0) bg.x = 0;
  if (bg.x > bg.w-imgBuffer.width-1) bg.x = bg.w-imgBuffer.width-1;
  if (bg.y < 0) bg.y = 0;
  if (bg.y > bg.h-imgBuffer.height-1) bg.y = bg.h-imgBuffer.height-1;
}

function frame(timestamp) {
  if (timestamp - frame_time >= 1000){
    fps = frame_count;
    frame_time = timestamp;
    frame_count = 0;
  }
  let elapsed_time = timestamp - last_update_time;
  // TODO: fazer o elapsed_time ser independente da limitação de fps abaixo.
  if (elapsed_time >= 0){
    last_update_time = timestamp;
    frame_count++;
    ctx.fillStyle = "blue";
    ctx.fillRect(0,0,imgBuffer.width,imgBuffer.height);
    ctx.putImageData(imgBuffer, 0, 0);
    ctx.textBaseline = "top";
    ctx.font = "20px Roboto";
    let s1 = "TESTE. " + (Math.random()*1000).toFixed(0);
    let s2 = fps + ' fps';
    ctx.fillStyle = "black";
    ctx.fillText(s1, 10+TEXT_SHADOW, 10+TEXT_SHADOW);
    ctx.fillText(s2, imgBuffer.width - ctx.measureText(s2).width - 10+TEXT_SHADOW, 10+TEXT_SHADOW);
    ctx.fillText(debug_str, 10+TEXT_SHADOW, 450+TEXT_SHADOW);
    ctx.fillStyle = "white";
    ctx.fillText(s1, 10, 10);
    ctx.fillText(s2, imgBuffer.width - ctx.measureText(s2).width - 10, 10);
    ctx.fillText(debug_str, 10, 450);
    //draw(bgs[0], imgBuffer, elapsed_time);
    render(imgBuffer, elapsed_time);
  }
  window.requestAnimationFrame(frame);
};

function draw(bg, imgBuffer, elapsed_time) {
  /*
  for (let y = 0; y < imgBuffer.height; y++) {
    for (let x = 0; x < imgBuffer.width; x++) {
      let bidx = y * imgBuffer.width + x;
      let color = Math.trunc(Math.random() * 16);
      bg.buffer[bidx] = color;
      if (min_color > color) {
        min_color = color;
        debug_str = min_color + ' - ' + max_color;
      }
      if (max_color < color) {
        max_color = color;
        debug_str = min_color + ' - ' + max_color;
      }
    }
  }
  */
};

function onLineStart(lineIdx, elapsed_time, imgBuffer) {
  sinWave(bgs[0], lineIdx, elapsed_time, imgBuffer);
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

function setup(imgBuffer) {
  for (let p = 0; p < 16; p++){
    palette.push({r:p*10, g:p*10, b:p*10});
  }
  palette[15] = {r:255, g:0, b:0};
  for (let y = 0; y < imgBuffer.height; y++) {
    for (let x = 0; x < imgBuffer.width; x++) {
      let idx = 4 * (y * imgBuffer.width + x);
      imgBuffer.data[idx + 3] = 255;
    }
  }
  let bg = bgs[0];
  for (let y = 0; y < bg.h; y++) {
    for (let x = 0; x < bg.w; x++) {
      let bidx = y * bg.w + x;
      bg.buffer[bidx] = x % 15;
      if (y == 0 || x == 0) {
        bg.buffer[bidx] = 15;
      } else if (y == bg.h-1 || x == bg.w-1) {
        bg.buffer[bidx] = 15;
      }
    }
  }
};

function main() {
  canvas = document.getElementById("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.height = "100%";
  canvas.style.imageRendering = "pixelated";
  ctx = canvas.getContext("2d", { alpha: false, antialias: false, depth: false });
  ctx.imageSmoothingEnabled = false;

  imgBuffer = ctx.createImageData(canvas.width, canvas.height);

  window.onresize = () => {
    console.log(canvas.width + "x" + canvas.height + ", " + imgBuffer.width + "x" + imgBuffer.height);
  };

  setup(imgBuffer);
  window.requestAnimationFrame(frame);
}

main();

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
