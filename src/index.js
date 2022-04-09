const { sleep, getSerialPort, getBarValues, detectBarWidth } = require('./lib');

const { config, loop } = require('./class/kbz');

const DEBUG = false;
async function main() {
  const serialPort = getSerialPort(config);
  function cast(name) {
    if (config.keyMap[name]) {
      serialPort.write(config.keyMap[name]);
    }
    console.log((new Date()).toLocaleTimeString(), name.padEnd('4'), barValues);
  }
  let barValues;
  while (true) {
    barValues = await getBarValues(config);
    if (DEBUG) {
      console.log(barValues);
    }
    await loop(barValues, cast, sleep, Date.now());
    await sleep(config.interval ? config.interval : 50);
  }
}

main();