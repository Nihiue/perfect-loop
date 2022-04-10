const { sleep, getSerialPort, getBarValues, detectBarWidth, log, selectClass, bindHotKey } = require('./lib');


const DEBUG = false;
async function main() {
  const { config, loop } = await selectClass({
    'kbz': '战士-狂暴',
    'druid-tank': '德鲁伊-守护'
  });
  const serialPort = getSerialPort(config);
  let barValues;

  let mode = '';

  const hotKeyMap = {
    'F9': 'SINGLE',
    'F10': 'AOE',
    'F11': ''
  };

  bindHotKey(Object.keys(hotKeyMap), (key) => {
    mode = hotKeyMap[key];
    process.stdout.write('\x07');
    log('模式', mode || 'OFF');
  });

  function cast(name) {
    if (config.keyMap[name]) {
      serialPort.write(config.keyMap[name]);
      log('Cast', name);
    } else {
      log('未找到按键', name);
    }
  }

  // ioHook.start(true);
  console.log('[F9] 单体模式    [F10] AOE模式    [F11] 关闭');
  log('等待指令...');
  while (true) {
    if (mode) {
      barValues = await getBarValues(config);
      if (DEBUG) {
        console.log(barValues);
      }
      await loop({
        cast,
        sleep,
        mode,
        $: barValues,
        now: Date.now()
      });
    }
    await sleep(config.interval ? config.interval : 50);
  }
}

main();
