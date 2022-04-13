const inquirer = require('inquirer');
const path = require('path');

async function sleep(ms = 500) {
  return new Promise(r => setTimeout(r, ms));
}

function hex(n) {
  return n.toString(16).padStart(2, '0');
}

function log(...args) {
  const a = new Date();
  console.log(`${a.getHours().toString().padStart(2, '0')}:${a.getMinutes().toString().padStart(2, '0')}:${a.getSeconds().toString().padStart(2, '0')}`, ...args);
}

async function selectClass(dict) {
  const opt = [
    {
      type: "list",
      name: "class",
      message: "Perfect Loop By Nihiue",
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

const basePath = __dirname.includes('\\snapshot\\') ? process.execPath : __dirname;

module.exports = {
  sleep,
  hex,
  log,
  selectClass,
  beep,
  classFolderPath: path.join(basePath, '../class'),
  globalConfigPath: path.join(basePath, '../class/global-config.json')
};
