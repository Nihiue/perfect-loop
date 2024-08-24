module.exports.config = {
  // 依次是每个进度条的名字
  bars: ['怒气', 'GCD', '嗜血', '旋风斩', '目标血量', '主手攻击', '英勇顺劈', '横扫攻击', '乘胜追击', '破甲', '混合斩杀', '乱舞'],
  // 技能名称和案件的对应关系
  keyMap: {
    '嗜血': '1',
    '旋风斩': '2',
    '英勇': '3',
    '顺劈斩': '4',
    '乘胜追击': '5',
    '横扫攻击': '6',
    '斩杀': 'E',
    '断筋': 'T',
    '破甲': '9',
    '取消英勇': '0',
  },
};

module.exports.loop = async function({ $, cast, sleep, now, mode, setNextInterval }) {
  let gcdReady = $.GCD < 7;

  if (gcdReady) {
    if ($.乘胜追击 > 0 && $.怒气 > 0) {
      cast('乘胜追击');
      gcdReady = false;
    } else if ($.怒气 >= 15 && $.破甲 > 1 && $.破甲 <= 15) {
      cast('破甲');
      gcdReady = false;
    }
  }

  if (mode === 'AOE') {
    if ($.横扫攻击 >= 90) { // 横扫持续期间 AOE
      if ($.怒气 >= 20) {
        if ($.英勇顺劈 < 1) {
          cast('顺劈斩');
        }
        if (gcdReady && $.嗜血 <= 0 && $.怒气 >= 30) {
          cast('嗜血');
        }
      }
    } else { // 非横扫持续 AOE
      if ($.怒气 >= 25) {
        if ($.旋风斩 <= 0 && gcdReady) {
          cast('旋风斩');
        } else if ($.横扫攻击 <= 0 && $.怒气 >= 65 && gcdReady) {
          cast('横扫攻击');
        } else if ($.横扫攻击 > 10 || $.怒气 >= 80) { // 横扫还有很久 可以泄怒
          if ($.英勇顺劈 < 1) {
            cast('顺劈斩');
          }
          if (gcdReady && $.嗜血 <= 0 && $.怒气 >= 50 && $.横扫攻击 > 20) {
            cast('嗜血');
          }
        }
      }
    }
  } else {
    const 斩杀阶段 = $.目标血量 < 20;
    const 嗜血旋风斩即将就绪 = $.嗜血 <= 35 || $.旋风斩 <= 23;
    const 启用嗜血旋风斩 = !斩杀阶段 || $.混合斩杀 > 0;

    if (gcdReady) {
      if (斩杀阶段 && $.怒气 > 95) {
        // 满怒斩杀
        cast('斩杀');
      } else if (启用嗜血旋风斩 && $.怒气 >= 30 && $.嗜血 <= 0) {
        cast('嗜血');
      } else if (启用嗜血旋风斩 && $.怒气 >= 25 && $.旋风斩 <= 0) {
        cast('旋风斩');
      } else if(!斩杀阶段 && $.怒气 > 60 && $.乱舞 < 1 && !嗜血旋风斩即将就绪) {
        cast('断筋');
      } else if (斩杀阶段 && $.怒气 >= 12) {
        // 低怒斩杀
        cast('斩杀');
      }
    }

    if ($.英勇顺劈 > 0) { // 英勇激活
      if ((斩杀阶段 || ($.怒气 <= 35 && 嗜血旋风斩即将就绪)) && $.主手攻击 >= 85) {
        cast('取消英勇');
      } else if ($.主手攻击 >= 80 && $.主手攻击 < 85) {
        setNextInterval(0.5);
      }
    } else {
      if ($.主手攻击 > 0 && $.主手攻击 < 80 && $.怒气 >= 12) {
        cast('英勇');
      }
    }
  }
}