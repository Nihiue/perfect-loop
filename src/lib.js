const robotjs = require('@jitsi/robotjs');
const { SerialPort } = require('serialport');
const inquirer = require("inquirer");
const { rsHook } = require('@tcardlab/rshook');

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
  const img = await getScreenShot(barPosition.x + barPosition.width + 10, barPosition.y + barPosition.height * (bars.length + 2));
  const ret = {};

  function getNthPoint(i, py) {
    const px = barPosition.x + barPosition.width * ((i - 0.5) / 100);

    return getColor(img, px, py);
  }

  bars.forEach((name, idx) => {
    const barY = barPosition.y + barPosition.height * (idx + 0.5);
    let ptIdx = 0;
    for (let i = 1; i <= 100; i += 20) {
      const c = getNthPoint(i, barY);
      if (c === COLOR_ACTIVE) {
        ptIdx = i;
      } else if (c !== COLOR_BG){
        ptIdx = -1;
        break;
      }
    }
    if (ptIdx !== -1) {
      const rangeEnd = Math.min(100, ptIdx + 19);
      for (let k = ptIdx + 1; k <= rangeEnd; k += 2) {
        if (getNthPoint(k, barY) === COLOR_ACTIVE) {
          ptIdx = k;
        }
      }
    }
    ret[name] = ptIdx;
  });

  return ret;
}

module.exports.getSerialPort = function (config) {
  return new SerialPort({
    path: config.port,
    baudRate: 19200,
  });
}

module.exports.log = function (...args) {
  const a = new Date();
  console.log(`${a.getHours().toString().padStart(2, '0')}:${a.getMinutes().toString().padStart(2, '0')}:${a.getSeconds().toString().padStart(2, '0')}`, ...args);
}

module.exports.selectClass = async function(dict) {
  const opt = [
    {
      type: "list",
      name: "class",
      message: "选择职业和专精",
      choices: Object.keys(dict).map(k => {
        return {
          name: dict[k],
          value: k
        };
      })
    }
  ];
  const answer = await inquirer.prompt(opt);
  return require('../class/' + answer.class);
}

module.exports.bindHotKey = function (keys, callback) {
  const cb = (Error, ...ogEvent) => {
    if (ogEvent[0] === 'keydown' && keys.includes(ogEvent[3])) {
      callback(ogEvent[3]);
    }
  }
  rsHook(cb);
}
