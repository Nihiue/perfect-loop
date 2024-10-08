const fs = require('fs');

const robotjs = require('@jitsi/robotjs');
const { SerialPort } = require('serialport');
const { rsHook } = require('@tcardlab/rshook');
const { sleep, globalConfigPath, colorEqual } = require('./utils');
const inquirer = require('inquirer');

const COLOR_ACTIVE = [255, 0, 0];
const COLOR_BG = [40, 40, 40];
const COLOR_DETECT = [196, 0, 255];

function getColor(img, x, y) {
  const buffer = img.image;
  const startIndex =
    (Math.floor(y) * img.width + Math.floor(x)) * img.bytesPerPixel;

  if (typeof buffer[startIndex + 2] === 'undefined') {
    console.log('point out of range', x, y, buffer.length);
    return '';
  }
  return [buffer[startIndex + 2], buffer[startIndex + 1], buffer[startIndex]];
}

module.exports.getBarValues = async function getBarValues(bars, barPosition) {
  const areaW = Math.round(barPosition.width * 1.1);
  const areaH = Math.round(barPosition.height * bars.length * 1.25);

  const img = await robotjs.screen.capture(
    barPosition.x,
    barPosition.y,
    areaW,
    areaH
  );

  const ret = {};

  bars.forEach((name, idx) => {
    const barY = barPosition.height * (1.2 * idx + 0.5);

    const startColor = getColor(img, 0, barY);
    const endColor = getColor(img, barPosition.width, barY);

    if (colorEqual(startColor, COLOR_BG) && colorEqual(endColor, COLOR_BG)) {
      ret[name] = 0;
    } else if (
      colorEqual(startColor, COLOR_ACTIVE) &&
      colorEqual(endColor, COLOR_ACTIVE)
    ) {
      ret[name] = 100;
    } else {
      let low = 0,
        high = barPosition.width,
        mid = 0;

      while (low < high - 1) {
        mid = Math.floor((low + high) / 2);
        const curColor = getColor(img, mid, barY);
        if (colorEqual(curColor, COLOR_ACTIVE)) {
          low = mid;
        } else if (colorEqual(curColor, COLOR_BG)) {
          high = mid;
        } else {
          low = -1;
          break;
        }
      }
      if (low === -1) {
        ret[name] = -1;
      } else {
        ret[name] = Math.round((100 * low) / barPosition.width);
      }
    }
  });

  return ret;
};

module.exports.initKeyboard = function initKeyboard(config) {
  if (config.softKeyboard) {
    robotjs.setKeyboardDelay(25);
    return function (k) {
      if (typeof k === 'string') {
        robotjs.keyTap(k);
      } else {
        robotjs.keyTap(k[0], k[1]);
      }
    };
  } else {
    const serialport = new SerialPort({
      path: config.port,
      baudRate: 9600,
    });
    return function (k) {
      if (typeof k === 'string') {
        serialport.write(k);
      }
    };
  }
};

module.exports.registerHotkey = function (keys, callback) {
  const cb = (Error, ...ogEvent) => {
    if (ogEvent[0] === 'keydown' && keys.includes(ogEvent[3])) {
      callback(ogEvent[3]);
    }
  };
  rsHook(cb);
};

async function detectBarSize(globalConfig) {
  const { width, height } = await robotjs.getScreenSize();
  // const w = Math.round(width / 2);
  // const h = Math.round(height / 2);

  console.log('请导入定位 WA 并切换到游戏画面');
  console.log(`检测范围 ${w} * ${h}`);

  while (true) {
    let x0 = 99999,
      x1 = -1,
      y0 = 99999,
      y1 = -1;
    const img = await robotjs.screen.capture(0, 0, width, height);
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        if (colorEqual(getColor(img, x, y), COLOR_DETECT)) {
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
    if (x1 - x0 > 100 && y1 - y0 > 5) {
      globalConfig.barPosition = {
        x: x0,
        y: y0,
        width: x1 - x0,
        height: y1 - y0,
      };
      return;
    } else {
      console.log('未找到色块');
    }
    await sleep(2000);
  }
}

module.exports.showConfig = async function (globalConfig) {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message: '设置',
      choices: [
        {
          name: globalConfig.softKeyboard
            ? '切换到外部硬件键盘'
            : '切换到软件模拟键盘',
          value: 'toogle-keyboard',
        },
        {
          name: globalConfig.sound ? '关闭声音' : '开启声音',
          value: 'toggle-sound',
        },
        {
          name: globalConfig.debug ? '关闭 DEBUG' : '开启 DEBUG',
          value: 'toggle-debug',
        },
        {
          name: '寻找WA显示位置',
          value: 'detect-bar',
        },
        {
          name: '回到上级菜单',
          value: 'exit',
        },
      ],
    },
  ]);
  switch (answer.selection) {
    case 'toogle-keyboard':
      globalConfig.softKeyboard = !globalConfig.softKeyboard;
      if (!globalConfig.softKeyboard) {
        const ports = await SerialPort.list();
        if (ports.length === 0) {
          console.log('未找到可用的串口');
          return;
        }
        const portAns = await inquirer.prompt([
          {
            type: 'list',
            name: 'selection',
            message: '选择硬件键盘串口',
            choices: ports.map(function (p) {
              return {
                name: `${p.path} - ${p.friendlyName}`,
                value: p.path,
              };
            }),
          },
        ]);
        globalConfig.port = portAns.selection;
      }
      break;
    case 'toggle-sound':
      globalConfig.sound = !globalConfig.sound;
      break;
    case 'detect-bar':
      await detectBarSize(globalConfig);
      break;
    case 'toggle-debug':
      globalConfig.debug = !globalConfig.debug;
      break;
    default:
      return;
  }

  fs.writeFileSync(
    globalConfigPath,
    JSON.stringify(globalConfig, null, 2),
    'utf-8'
  );

  if (answer.selection === 'detect-bar') {
    console.log('配置已更新, 15s后自动返回上级菜单', globalConfig.barPosition);
    await sleep(15 * 1000);
  }

  return;
};
