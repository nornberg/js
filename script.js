const WIDTH = 100;
const HEIGHT = 100;

function draw() {
  const canvas = document.getElementById('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d', { alpha: false, antialias: false, depth: false });
    ctx.imageSmoothingEnabled = false;
    const imgBuffer = ctx.createImageData(WIDTH, HEIGHT);

    for (let y=0; y<HEIGHT; y++) {
      for (let x=0; x<WIDTH; x++) {
        const idx = 4 * (y * WIDTH + x);
        imgBuffer.data[idx+0] = 250;
        imgBuffer.data[idx+1] = 250;
        imgBuffer.data[idx+2] = 250;
        imgBuffer.data[idx+3] = 250;
      }
    }
    
  }
}

draw();
