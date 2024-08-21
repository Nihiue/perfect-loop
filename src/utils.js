const inquirer = require('inquirer');
const path = require('path');

function sleep(ms = 500) {
  if (typeof ms !== 'number' || ms <= 0) {
    return;
  }
  return new Promise(r => setTimeout(r, ms));
}

function toHex(n) {
  return n.toString(16).padStart(2, '0');
}

function colorEqual(c1, c2) {
  if (c1.length !== 3 || c2.length !== 3) {
    throw new Error('invalid color');
  }
  return (
    Math.abs(c1[0] - c2[0]) < 10 &&
    Math.abs(c1[1] - c2[1]) < 10 &&
    Math.abs(c1[2] - c2[2]) < 10
  );
}

function log(...args) {
  const a = new Date();
  console.log(`${a.getHours().toString().padStart(2, '0')}:${a.getMinutes().toString().padStart(2, '0')}:${a.getSeconds().toString().padStart(2, '0')}.${(a.valueOf() % 1000).toString().padStart(3, '0')}`, ...args);
}

async function selectClass(dict) {
  const opt = [
    {
      type: "list",
      name: "class",
      message: "主菜单",
      choices: Object.keys(dict).map(k => {
        return {
          name: dict[k],
          value: k
        };
      })
    }
  ];
  opt[0].choices.push({
    name: '设置',
    value: 'config'
  });
  const answer = await inquirer.prompt(opt);
  return answer.class;
}

function beep() {
  process.stdout.write('\x07');
}

const basePath = __dirname.includes('\\snapshot\\') ? process.execPath : path.join(__dirname, '../perfect-loop-release/wlk');

module.exports = {
  sleep,
  toHex,
  log,
  selectClass,
  beep,
  colorEqual,
  classFolderPath: path.join(basePath, '../wlk'),
  globalConfigPath: path.join(basePath, '../wlk/global-config.json')
};
