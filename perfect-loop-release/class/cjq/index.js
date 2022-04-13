module.exports.config = {
  // 依次是每个进度条的名字
  bars: ['下次普攻_4', 'GCD', '十字军打击', '审判', '命令圣印', '鲜血圣印', '法术急速'],
  // 技能名称和案件的对应关系
  keyMap: {
    '十字军打击': '1',
    '审判': '2',
    '命令圣印': '3',
    '鲜血圣印': '4'
  }
};

module.exports.loop = async function({ $, cast, sleep, now, mode }) {
  if ($.下次普攻_4 < 0) {
    return;
  }
  const gcdLength = 1.5 * (1 - $.法术急速);
  const gcdReady = $.GCD < 5;
  const 下次普攻 = $.下次普攻_4 / 100 * 4;

  if (gcdReady) {
    if ($.鲜血圣印 > 0) {
      if ($.十字军打击 <= 0) {
        cast('十字军打击');
      } else if ($.审判 <= 0) {
        cast('审判');
      } else if (下次普攻 > gcdLength) {
        cast('命令圣印');
      }
    } else if ($.命令圣印 > 0) {
      if ($.十字军打击 <= 0 && 下次普攻 > gcdLength + 0.4) {
        cast('十字军打击');
      } else if ($.下次普攻InSec <= 0.4) {
        cast('鲜血圣印');
      }
    } else if ($.审判 > 0) {
      cast(下次普攻 <= gcdLength ? '鲜血圣印' : '命令圣印')
    }
  }
}