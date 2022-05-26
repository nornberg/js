const WIDTH = 400;
const HEIGHT = 400;

function draw() {
  const canvas = document.getElementById('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const imgBuffer = ctx.createImageData(WIDTH, HEIGHT);

    for (let y=0; y<HEIGHT; y++) {
      for (let x=0; x<HEIGHT; y++) {
      
      }
    }
    
  }
}

draw();
