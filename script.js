const WIDTH = 1000;
const HEIGHT = 1000;

const frame = () => {
  ctx.putImageData(imgBuffer, 0, 0);
  ctx.textBaseline = "top";
  ctx.font = "50px Roboto";
  ctx.fillStyle = "blue";
  ctx.fillText("Teste", 10, 10);
  window.requestAnimationFrame(frame);
};

const draw = (imgBuffer) => {
  console.time("draw");
  for (let y = 0; y < imgBuffer.height; y++) {
    for (let x = 0; x < imgBuffer.width; x++) {
      const idx = 4 * (y * imgBuffer.width + x);
      const cx = x * (255 / imgBuffer.width);
      imgBuffer.data[idx + 0] = cx;
      imgBuffer.data[idx + 1] = cx;
      imgBuffer.data[idx + 2] = cx;
      imgBuffer.data[idx + 3] = 255;
    }
  }
  console.timeEnd("draw");
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
draw(imgBuffer);

window.onresize = () => {
  console.log(canvas.width + "x" + canvas.height + ", " + imgBuffer.width + "x" + imgBuffer.height);
};

window.requestAnimationFrame(frame);
