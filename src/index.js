const { sleep, getSerialPort, getBarValues, detectBarSize, log, selectClass, bindHotKey } = require('./lib');

const DEBUG = false;

const hotKeyMap = {
  'F9': 'SINGLE',
  'F10': 'AOE',
  'F11': ''
};

async function main() {
  const selection = await selectClass({
    'kbz': '战士 - 狂暴',
    'druid-tank': '德鲁伊 - 守护',
    'cjq': '圣骑士 - 惩戒',
    'detect-bar': '工具 - 自动寻找 WA 位置'
  });

  if (selection === 'detect-bar') {
    await detectBarSize();
    return;
  }
  const globalConfig = require('../class/global-config.json');
  const { config: classConfig, loop } = require('../class/' + selection);
  bindHotKey(Object.keys(hotKeyMap), (key) => {
    mode = hotKeyMap[key];
    process.stdout.write('\x07');
    log('模式', mode || 'OFF');
  });
  console.log('[F9] 单体模式    [F10] AOE模式    [F11] 关闭');
  log('等待指令...');

  const serialPort = getSerialPort(globalConfig.port);
  let barValues, mode = '';

  function cast(name) {
    if (classConfig.keyMap[name]) {
      serialPort.write(classConfig.keyMap[name]);
      log('Cast', name, DEBUG ? JSON.stringify(barValues) : '');
    } else {
      log('未找到按键', name);
    }
  }

  async function loopPass() {
    barValues = await getBarValues(classConfig.bars, globalConfig.barPosition);
    await loop({
      cast,
      sleep,
      mode,
      $: barValues,
      now: Date.now()
    });
  }

  while (true) {
    if (mode) {
      await Promise.all([
        loopPass(),
        sleep(100)
      ]);
    } else {
      await sleep(500);
    }
  }
}

main();
