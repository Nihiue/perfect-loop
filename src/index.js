const { sleep, getSerialPort, getBarValues, detectBarWidth } = require('./lib');
const inquirer = require("inquirer");

main();

const DEBUG = false;
async function main() {
  const answer = await inquirer
  .prompt([
    {
      type: "list",
      name: "class",
      message: "选择职业和专精",
      choices: [{
        name: '战士-狂暴',
        value: "kbz"
      }, {
        name: '德鲁伊-守护',
        value: "druid-tank"
      }]
    }
  ]);
  const { config, loop } = require('../class/' + answer.class);

  const serialPort = getSerialPort(config);
  function cast(name) {
    if (config.keyMap[name]) {
      serialPort.write(config.keyMap[name]);
    }
    console.log((new Date()).toLocaleTimeString(), name.padEnd('4'), barValues);
  }
  let barValues;
  console.log('超级瞄准已经部署');
  while (true) {
    barValues = await getBarValues(config);
    if (DEBUG) {
      console.log(barValues);
    }
    await loop(barValues, cast, sleep, Date.now());
    await sleep(config.interval ? config.interval : 50);
  }
}

