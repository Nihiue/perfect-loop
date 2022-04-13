module.exports.config = {
  // 依次是每个进度条的名字
  bars: ['怒气', 'GCD', '嗜血', '旋风斩', '目标血量', '主手攻击', '英勇顺劈', '横扫攻击', '乘胜追击', '破甲'],
  // 技能名称和案件的对应关系
  keyMap: {
    '嗜血': '1',
    '旋风斩': '2',
    '英勇': '3',
    '顺劈斩': '4',
    '乘胜追击': '6',
    '斩杀': 'E',
    '横扫攻击': 'T',
    '破甲': '9',
    '取消英勇': '0',
  },
};

module.exports.loop = async function({ $, cast, sleep, now, mode }) {
  let 预估剩余怒气 = $.怒气;
  let gcdReady = $.GCD < 5;

  if (gcdReady) {
    if ($.乘胜追击 > 0 && $.怒气 > 0) {
      cast('乘胜追击');
      gcdReady = false;
    } else if ($.怒气 >= 15 && $.破甲 > 1 && $.破甲 <= 20) {
      cast('破甲');
      gcdReady = false;
    }
  }

  if (mode === 'AOE') {
    if ($.横扫攻击 >= 80) { // 横扫持续期间 AOE
      if (预估剩余怒气 >= 20) {
        if ($.英勇顺劈 < 1) {
          cast('顺劈斩');
        }
        预估剩余怒气 -= 20;
        if (gcdReady && 预估剩余怒气 >= 40) {
          if ($.嗜血 <= 0) {
            cast('嗜血');
            预估剩余怒气 -= 30;
          } else if ($.旋风斩 <= 0) {
            cast('旋风斩');
            预估剩余怒气 -= 25;
          }
        }
      }
    } else { // 非横扫持续 AOE
      if (预估剩余怒气 >= 25) {
        if ($.旋风斩 <= 0 && gcdReady) {
          cast('旋风斩');
          预估剩余怒气 -= 25;
        } else if ($.横扫攻击 <= 0 && 预估剩余怒气 >= 50 && gcdReady) {
          cast('横扫攻击');
          预估剩余怒气 -= 30;
        } else if ($.横扫攻击 > 20) { // 横扫还有很久 可以泄怒
          if ($.英勇顺劈 < 1) {
            cast('顺劈斩');
            预估剩余怒气 -= 20;
          }
          if (gcdReady && $.嗜血 <= 0 && 预估剩余怒气 >= 60) {
            cast('嗜血');
            预估剩余怒气 -= 30;
          }
        }
      }
    }
  } else {
    if ($.目标血量 >= 20) { // 单体非斩杀
      if (预估剩余怒气 >= 30 && gcdReady) {
        if ($.嗜血 <= 0) {
          cast('嗜血');
          预估剩余怒气 -= 30;
        } else if ($.旋风斩 <= 0) {
          cast('旋风斩');
          预估剩余怒气 -= 25;
        }
      }

      if ($.英勇顺劈 > 0) { // 英勇激活
        if (预估剩余怒气 < 50 && $.主手攻击 >= 80) {
          cast('取消英勇');
        }
      } else {
        if ($.主手攻击 > 0 && $.主手攻击 < 60 && 预估剩余怒气 >= 12) {
          cast('英勇');
        }
      }
    } else { // 单体斩杀
      if (gcdReady && 预估剩余怒气 >= 12) {
        cast('斩杀');
        预估剩余怒气 = 0;
      }
    }
  }
}