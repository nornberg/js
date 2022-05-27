const WIDTH = 129;
const HEIGHT = 129;

function draw() {
  const canvas = document.getElementById('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  //canvas.style.height = "100%";
  canvas.style.imageRendering = "pixelated";
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d', { alpha: false, antialias: false, depth: false });
    ctx.imageSmoothingEnabled = false;
    
    const imgBuffer = ctx.createImageData(WIDTH, HEIGHT);
    for (let y=0; y<HEIGHT; y++) {
      for (let x=0; x<WIDTH; x++) {
        const idx = 4 * (y * WIDTH + x);
        imgBuffer.data[idx+0] = 150;
        imgBuffer.data[idx+1] = 150;
        imgBuffer.data[idx+2] = 150;
      }
    }
    ctx.putImageData(imgBuffer, 0, 0);
    /*
    ctx.textBaseline = "top";
    ctx.font = "50px Roboto";
    ctx.fillStyle = "blue";
    ctx.fillText("Teste", 10, 10);
    */
  }
}

draw();
