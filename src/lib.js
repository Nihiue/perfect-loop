
const fs = require('fs');
const path = require('path');

const robotjs = require('@jitsi/robotjs');
const inquirer = require("inquirer");
const { SerialPort } = require('serialport');
const { rsHook } = require('@tcardlab/rshook');


const COLOR_ACTIVE = 'ff0000';
const COLOR_BG = '282728';
const COLOR_DETECT = 'c400ff';

async function getScreenShot(w, h) {
  try {
    const img = robotjs.screen.capture(0, 0, w, h);
    return img;
  } catch (e) {
    console.log(e);
    return null;
  }
}

function hex(n) {
  return n.toString(16).padStart(2, '0');
}

async function sleep(ms = 500) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports.sleep = sleep;

const basePath = __dirname.includes('\\snapshot\\') ? process.execPath : __dirname;
const classFolderPath = path.join(basePath, '../class');
const globalConfigPath = path.join(classFolderPath, 'global-config.json');

module.exports.classFolderPath = classFolderPath;
module.exports.globalConfigPath = globalConfigPath;

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

module.exports.detectBarSize = async function detectBarSize() {
  const { width, height } = await robotjs.getScreenSize();
  const w = Math.round(width / 2);
  const h = Math.round(height / 2);

  console.log('请导入定位 WA 并切换到游戏画面');
  console.log(`检测范围 ${w} * ${h}`);

  const globalConfig = require(globalConfigPath);
  while (true) {
    let x0 = 99999, x1 = -1, y0 = 99999, y1 = -1;
    const img = await getScreenShot(w, h);
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        if (getColor(img, x, y) === COLOR_DETECT) {
          if (x0 > x) {
            x0 = x;
          }
          if (x1 < x) {
            x1 = x;
          }
          if (y0 > y) {
            y0 = y;
          }
          if (y1 < y) {
            y1 = y;
          }
        }
      }
    }
    if (x1 - x0 > 50 && y1 - y0 > 5) {
      globalConfig.barPosition = {
        x: x0,
        y: y0,
        width: x1 - x0,
        height: y1 - y0
      };
      fs.writeFileSync(
        globalConfigPath,
        JSON.stringify(globalConfig, null, 2),
        'utf-8'
      );
      console.log('配置已更新');
      console.log(globalConfig.barPosition);
    } else {
      console.log('未找到色块');
    }
    await sleep(2000);
  }
}

module.exports.getBarValues = async function getBarValues(bars, barPosition) {
  const areaW = Math.round(barPosition.x + barPosition.width * 1.1);
  const areaH = Math.round(barPosition.y + barPosition.height * bars.length * 1.1);
  const img = await getScreenShot(areaW, areaH);
  const ret = {};

  bars.forEach((name, idx) => {
    const barY = barPosition.y + 1.1 * barPosition.height * (idx + 0.5);

    const startColor = getColor(img, barPosition.x + 1, barY);
    const endColor = getColor(img, barPosition.x + barPosition.width - 1 , barY);

    if (startColor === COLOR_BG && endColor === COLOR_BG) {
      ret[name] = 0;
    } else if (startColor === COLOR_ACTIVE && endColor === COLOR_ACTIVE) {
      ret[name] = 100;
    } else {
      let low = 1, high = barPosition.width, mid = 0;

      while (low < high - 1) {
        mid = Math.floor((low + high) / 2);
        const curColor = getColor(img, barPosition.x + mid, barY);
        if (curColor === COLOR_ACTIVE) {
          low = mid;
        } else if (curColor === COLOR_BG) {
          high = mid;
        } else {
          low = -1;
          break;
        }
      }
      if (low === -1) {
        ret[name] = -1;
      } else {
        ret[name] = Math.round(100 * low / barPosition.width);
      }
    }
  });

  return ret;
}

module.exports.getSerialPort = function (port) {
  return new SerialPort({
    path: port,
    baudRate: 9600,
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
      message: "选择职业及专精",
      choices: Object.keys(dict).map(k => {
        return {
          name: dict[k],
          value: k
        };
      })
    }
  ];
  const answer = await inquirer.prompt(opt);
  return answer.class;
}

module.exports.bindHotKey = function (keys, callback) {
  const cb = (Error, ...ogEvent) => {
    if (ogEvent[0] === 'keydown' && keys.includes(ogEvent[3])) {
      callback(ogEvent[3]);
    }
  }
  rsHook(cb);
}

module.exports.beep = function () {
  process.stdout.write('\x07');
}
