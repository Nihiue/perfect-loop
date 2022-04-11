module.exports.config = {
  // 依次是每个进度条的名字
  bars: ['下次普攻_4', 'GCD', '十字军打击', '审判', '命令圣印', '鲜血圣印'],
  // 技能名称和案件的对应关系
  keyMap: {
    '十字军打击': '1',
    '审判': '2',
    '命令圣印': '3',
    '鲜血圣印': '4'
  }
};

const gcdArr = [100];
module.exports.loop = async function({ $, cast, sleep, now, mode }) {
  if ($.下次普攻_4 < 0) {
    return;
  }
  const gcdReady = $.GCD < 5;
  const 下次普攻InSec = $.下次普攻_4 /100 * 4;

  if ($.GCD > 5) {
    gcdArr.push($.GCD);
    if (gcdArr.length > 30) {
      gcdArr.shift();
    }
  }

  $.totalGCD = Math.max(1.2, 0.05 + Math.max(...gcdArr) / 100 * 1.5);

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