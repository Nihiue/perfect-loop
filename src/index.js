const { sleep, getSerialPort, getBarValues, detectBarWidth, log, selectClass, hookAltF } = require('./lib');


const DEBUG = false;
async function main() {
  const { config, loop } = await selectClass({
    'kbz': '战士-狂暴',
    'druid-tank': '德鲁伊-守护'
  });
  const serialPort = getSerialPort(config);
  let barValues;

  let mode = '';

  hookAltF(function(key) {
    if (key === 'F9') {
      mode = 'SINGLE';
    } else if (key === 'F10') {
      mode = 'AOE';
    } else {
      mode = '';
    }
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
  console.log('[Alt + F9] 单体模式 \n[Alt + F10] AOE模式\n[Alt + F11] 关闭');

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
