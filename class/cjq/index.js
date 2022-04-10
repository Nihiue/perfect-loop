module.exports.config = {
  // 依次是每个进度条的名字
  bars: ['下次普攻_4', 'GCD', '十字军打击', '审判', '命令圣印', '鲜血圣印'],
  // 技能名称和案件的对应关系
  keyMap: {
    '十字军打击': '1',
    '审判': '2',
    '命令圣印': '3',
    '鲜血圣印': '4'
  },
  // 每次循环间隔 单位 ms
  interval: 100,
  // 进度条的起始位置和每个进度条的宽度高度
  barPosition: {
    x: 7,
    y: 42,
    width: 140,
    height: 14.5,
  },
  // barPosition: {
  //     x: 7,
  //     y: 86,
  //     width: 136,
  //     height: 14,
  // },
  // 单片机串口
  port: 'COM8'
};

const gcdArr = [100];
module.exports.loop = async function({ $, cast, sleep, now, mode }) {
  if ($.下次普攻_4 < 0) {
    return;
  }
  const gcdReady = $.GCD < 10;
  const 下次普攻InSec = $.下次普攻_4 /100 * 4;

  if ($.GCD >= 70) {
    gcdArr.push($.GCD);
    if (gcdArr.length > 10) {
      gcdArr.shift();
    }
  }

  $.totalGCD = Math.max(1.2, Math.max(...gcdArr) / 100 * 1.5) + 0.05;
  if (gcdReady) {
    if ($.鲜血圣印 > 0) {
      if ($.十字军打击 <= 0) {
        cast('十字军打击');
      } else if ($.审判 <= 0) {
        cast('审判');
      } else if (下次普攻InSec > $.totalGCD) {
        cast('命令圣印');
      }
    } else if ($.命令圣印 > 0) {
      if ($.十字军打击 <= 0 && 下次普攻InSec > $.totalGCD + 0.4) {
        cast('十字军打击');
      } else if ($.下次普攻InSec <= 0.4) {
        cast('鲜血圣印');
      }
    } else if ($.审判 > 0) {
      cast(下次普攻InSec <= $.totalGCD ? '鲜血圣印' : '命令圣印')
    }
  }
}