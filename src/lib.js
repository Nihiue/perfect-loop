const robotjs = require('@jitsi/robotjs');
const { SerialPort } = require('serialport');

const COLOR_ACTIVE = 'ff0000';
const COLOR_BG = '282728';

async function getScreenShot(w, h) {
  try {
    const img = robotjs.screen.capture(0, 0, w, h);
    return img;
  } catch (e) {
    console.log(e);
    return null;
  }
}

module.exports.sleep = async function sleep(ms = 500) {
  return new Promise(r => setTimeout(r, ms));
}
function hex(n) {
  return n.toString(16).padStart(2, '0');
}

function getColor (img, x, y) {
  const index = (Math.round(y) * img.width + Math.round(x)) * img.bytesPerPixel;
  if (typeof img.image[index + img.bytesPerPixel - 1] === 'undefined') {
    console.log('img out of range', index + 2, img.image.length);
    return '';
  }
  let ret = '';
  for (let i = img.bytesPerPixel  - 2; i >= 0; i -= 1) {
    ret += hex(img.image[index + i]);
  }
  return ret;
}

module.exports.detectBarWidth = async function detectBarWidth(x, y) {
  const { width } = await robotjs.getScreenSize();
  const img = await getScreenShot(width, y + 1);
  for (let i = x; i < width; i += 1) {
    const c = getColor(img, i, y);
    if (c !== COLOR_ACTIVE && c !== COLOR_BG) {
      return i - x;
    }
  }
}

module.exports.getBarValues = async function getBarValues({ bars, barPosition }) {
  const img = await getScreenShot(barPosition.x + barPosition.width, barPosition.y + barPosition.height * (bars.length + 1));
  const ret = {};

  bars.forEach((name, idx) => {
    ret[name] = 0;
    for (let i = 0; i <= 20; i += 1) {
      const px = barPosition.x + barPosition.width * (i / 20 + 0.025);
      const py = barPosition.y + barPosition.height * idx;
      const c = getColor(img, px, py);
      if (c === COLOR_ACTIVE) {
        ret[name] = i / 2;
      } else if (c !== COLOR_BG){
        if (i === 0) {
          ret[name] = -1;
        }
        break;
      }
    }
  });

  return ret;
}

module.exports.getSerialPort = function (config) {
  return new SerialPort({
    path: config.port,
    baudRate: 19200,
  });
}