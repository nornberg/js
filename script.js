const WIDTH = 1000;
const HEIGHT = 1000;
let fps = 0;
let frame_count = 0;
let frame_time = Date.now();

let palette = [];
let buffer = [][];

const frame = () => {
  frame_count++;
  if (Date.now() - frame_time > 1000){
    fps = frame_count;
    frame_time = Date.now();
    frame_count = 0;
  }
  ctx.putImageData(imgBuffer, 0, 0);
  ctx.textBaseline = "top";
  ctx.font = "50px Roboto";
  ctx.fillStyle = "red";
  ctx.fillText("TESTE " + (Math.random()*1000).toFixed(0), 10, 10);
  ctx.fillText(fps + ' fps', imgBuffer.width-140, 10);
  draw(imgBuffer);
  window.requestAnimationFrame(frame);
};

const draw = (imgBuffer) => {
  let lumi = Math.random()*50;
  for (let y = 0; y < imgBuffer.height; y++) {
    for (let x = 0; x < imgBuffer.width; x++) {
      const idx = 4 * (y * imgBuffer.width + x);
      const cx = x * (lumi / imgBuffer.width);
      imgBuffer.data[idx + 0] = cx;
      imgBuffer.data[idx + 1] = cx;
      imgBuffer.data[idx + 2] = cx;
      // if (x<=0 || x>=imgBuffer.width-1){
      //   imgBuffer.data[idx + 0] = 255;
      //   imgBuffer.data[idx + 1] = 0;
      //   imgBuffer.data[idx + 2] = 0;
      // }
      // if (y<=0 || y>=imgBuffer.height-1){
      //   imgBuffer.data[idx + 0] = 255;
      //   imgBuffer.data[idx + 1] = 0;
      //   imgBuffer.data[idx + 2] = 0;
      // }
    }
  }
};

const setup = (imgBuffer) => {
  for (let p = 0; p < 16; p++){
    palette.push({r:p*10, g:p*10, b:p*10});
  }
  for (let y = 0; y < imgBuffer.height; y++) {
    for (let x = 0; x < imgBuffer.width; x++) {
      const idx = 4 * (y * imgBuffer.width + x);
      imgBuffer.data[idx + 0] = 0;
      imgBuffer.data[idx + 1] = 0;
      imgBuffer.data[idx + 2] = 0;
      imgBuffer.data[idx + 3] = 255;
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
