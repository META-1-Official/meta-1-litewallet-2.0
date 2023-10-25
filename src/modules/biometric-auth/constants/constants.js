export const FRAME_RATE = 5;

export const DEFAULT_COLOR = 50;

export const CAMERA_CONTRAINTS = {
  '720p': {
    width: 1280,
    height: 720,
  },
  '1080p': {
    width: 1920,
    height: 1080,
  },
};

export const camOptions = {
  // aspectRatio: 9 / 16,
  width: 1920,
  height: 1080,
  frameRate: FRAME_RATE,
};

export const TASK = { REGISTER: 'register', VERIFY: 'verify' };
