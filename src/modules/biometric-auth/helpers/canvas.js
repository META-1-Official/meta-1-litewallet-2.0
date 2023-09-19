import { DEFAULT_COLOR, FRAME_RATE } from "../constants";
import loadingImage from "./loadingImage";

function getRandomColor() {
  return `rgb(${DEFAULT_COLOR},${DEFAULT_COLOR},${DEFAULT_COLOR})`;
}

export const _black = (canvas, { width = 600, height = 400, fps = FRAME_RATE } = {}) => {
  let context = canvas.getContext('2d');
  context.fillStyle = getRandomColor();
  context.fillRect(0, 0, width, height);
  let stream = canvas.captureStream(fps);

  function updateCanvas() {
    context.fillStyle = getRandomColor();
    context.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(
      () => {
        requestAnimationFrame(updateCanvas);
      },
      Math.round(1000 / fps),
    );
  }

  updateCanvas();

  return Object.assign(stream.getVideoTracks()[0], { enabled: true });
};

export const setCanvasToDefault = (processingCanvasRef) => {
    const ctx = processingCanvasRef.current.getContext('2d');

    // ctx.translate(processingCanvasRef.current.width, 0);
    // ctx.scale(-1, 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const img = new Image();
    img.src = loadingImage;

    img.onload = function () {
        ctx.drawImage(
            img,
            0,
            0,
            processingCanvasRef.current.width,
            processingCanvasRef.current.height,
        ); // Draw image to fill canvas
    };
};
