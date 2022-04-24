const path = require('path');
const { sleep, log, beep, selectClass, globalConfigPath, classFolderPath } = require('./utils');
const globalConfig = require(globalConfigPath);

const DEFAULT_LOOP_INTERVAL = 100;
const hotKeyMap = {
  'F9': 'SINGLE',
  'F10': 'AOE',
  'F11': ''
};

async function main() {
  try {
    const { getBarValues, showConfig, registerHotkey, initKeyboard } = require('./core');

    console.log('Perfect Loop - By Nihiue', '\n');
    console.log([
      `键盘：${globalConfig.softKeyboard ? '软件模拟' : ('硬件-' + globalConfig.port)}`,
      `声音: ${globalConfig.sound ? '开' : '关'}`,
      globalConfig.debug ? 'DEBUG启用' : ''
    ].join('  '), '\n');

    const selection = await selectClass(globalConfig.classMap);
    if (selection === 'config') {
      await showConfig(globalConfig);
      console.clear();
      return main();
    }

    const { config: classConfig, loop } = require(path.join(classFolderPath, selection));
    if (globalConfig.debug) {
      console.log(path.join(classFolderPath, selection), classConfig);
    }
    const pressKeyboard = initKeyboard(globalConfig);

    registerHotkey(Object.keys(hotKeyMap), (key) => {
      mode = hotKeyMap[key];
      log('模式', mode || 'OFF');
      if (globalConfig.sound) {
        beep();
      }
    });

    console.log('[F9] 单体模式    [F10] AOE模式    [F11] 关闭');
    log('等待指令...');

    let barValues, mode = '';

    function cast(name) {
      const k = classConfig.keyMap[name];
      if (typeof k === 'string' && k.length === 1) {
        pressKeyboard(k.toLowerCase());
        let ev = '';
        if (globalConfig.debug) {
          ev = Object.keys(barValues).map(function (k) {
            return `${k}:${barValues[k].toString().padEnd(3)}`;
          }).join(' ');
        }
        log('Cast', name.padEnd(4), ev);
      } else {
        log('未找到按键或按键配置无效', name);
      }
    }

    let nextIntervalValue = DEFAULT_LOOP_INTERVAL;
    function setNextInterval (v) {
      if (typeof v === 'number' && v > 0) {
        nextIntervalValue = Math.round(DEFAULT_LOOP_INTERVAL * Math.max(v, 0.2));
        if (globalConfig.debug) {
          log(`nextIntervalValue: ${nextIntervalValue}`);
        }
      }
    }

    async function loopPass(now) {
      try {
        barValues = await getBarValues(classConfig.bars, globalConfig.barPosition);
        await loop({
          cast,
          sleep,
          mode,
          now,
          $: barValues,
          setNextInterval
        });
      } catch (e) {
        log('loopPass 异常');
        console.log(e);
      }
    }

    while (true) {
      if (mode) {
        const startTime = Date.now();
        await loopPass(startTime);
        await sleep(nextIntervalValue + startTime - Date.now());
      } else {
        await sleep(500);
      }
      nextIntervalValue = DEFAULT_LOOP_INTERVAL;
    }
  } catch (e) {
    console.log(e);
    console.log('出现异常, 10秒后退出');
    setTimeout(() => {}, 10000);
  }
}

if (process.env.OS === 'Windows_NT' && Date.now() < 1654064265000) {
  main();
} else {
  console.log('不支持当前操作系统');
  setTimeout(() => {}, 10000);
}
