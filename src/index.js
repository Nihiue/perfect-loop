const path = require('path');
const { sleep, log, beep, selectClass, globalConfigPath, classFolderPath } = require('./utils');
const globalConfig = require(globalConfigPath);

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
      if (classConfig.keyMap[name]) {
        pressKeyboard(classConfig.keyMap[name]);
        log('Cast', name, globalConfig.debug ? JSON.stringify(barValues) : '');
      } else {
        log('未找到按键', name);
      }
    }

    async function loopPass() {
      try {
        barValues = await getBarValues(classConfig.bars, globalConfig.barPosition);
        await loop({
          cast,
          sleep,
          mode,
          $: barValues,
          now: Date.now()
        });
      } catch (e) {
        log('loopPass 异常');
        console.log(e);
      }
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
