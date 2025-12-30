const WIDTH = 640;
const HEIGHT = 480;
let fps = 0;
let frame_count = 0;
let frame_time = 0;
let last_update_time = 0;

let palette = [];
let buffer = [];

const frame = (timestamp) => {
  if (timestamp - frame_time >= 1000){
    fps = frame_count;
    frame_time = timestamp;
    frame_count = 0;
  }
  if (timestamp - last_update_time >= 33){
    last_update_time = timestamp;
    frame_count++;
    ctx.putImageData(imgBuffer, 0, 0);
    ctx.textBaseline = "top";
    ctx.font = "20px Roboto";
    ctx.fillStyle = "red";
    ctx.fillText("TESTE. " + (Math.random()*1000).toFixed(0), 10, 10);
    ctx.fillText(fps + ' fps', imgBuffer.width-140, 10);
    draw(imgBuffer);
  }
  window.requestAnimationFrame(frame);
};

const draw = (imgBuffer) => {
  let lumi = Math.random()*50;
  for (let y = 0; y < imgBuffer.height; y++) {
    for (let x = 0; x < imgBuffer.width; x++) {
      let bidx = y * imgBuffer.width + x;
      let idx = 4 * bidx;
      const cx = x * (lumi / imgBuffer.width);
      imgBuffer.data[idx + 0] = palette[buffer[bidx]].r;
      imgBuffer.data[idx + 1] = palette[buffer[bidx]].g;
      imgBuffer.data[idx + 2] = palette[buffer[bidx]].b;
      if (x<=0 || x>=imgBuffer.width-1){
        imgBuffer.data[idx + 0] = 255;
        imgBuffer.data[idx + 1] = 0;
        imgBuffer.data[idx + 2] = 0;
      }
      if (y<=0 || y>=imgBuffer.height-1){
        imgBuffer.data[idx + 0] = 255;
        imgBuffer.data[idx + 1] = 0;
        imgBuffer.data[idx + 2] = 0;
      }
    }
  }
};

const setup = (imgBuffer) => {
  for (let p = 0; p < 16; p++){
    palette.push({r:p*10, g:p*10, b:p*10});
  }
  for (let y = 0; y < imgBuffer.height; y++) {
    for (let x = 0; x < imgBuffer.width; x++) {
      let bidx = y * imgBuffer.width + x;
      let idx = 4 * bidx;
      imgBuffer.data[idx + 0] = 0;
      imgBuffer.data[idx + 1] = 0;
      imgBuffer.data[idx + 2] = 0;
      imgBuffer.data[idx + 3] = 255;
      buffer[bidx] = x % 16;
    }
  }
};

let canvas = null;
let ctx = null;
canvas = document.getElementById("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;
canvas.style.height = "100%";
canvas.style.imageRendering = "pixelated";
ctx = canvas.getContext("2d", { alpha: false, antialias: false, depth: false });
ctx.imageSmoothingEnabled = false;

const imgBuffer = ctx.createImageData(canvas.width, canvas.height);
setup(imgBuffer);

window.onresize = () => {
  console.log(canvas.width + "x" + canvas.height + ", " + imgBuffer.width + "x" + imgBuffer.height);
};

window.requestAnimationFrame(frame);
