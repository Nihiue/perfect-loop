module.exports.config = {
  // 依次是每个进度条的名字
  bars: ['怒气', 'GCD', '裂伤', '割伤', '精灵火'],
  // 技能名称和案件的对应关系
  keyMap: {
    '裂伤': '1',
    '横扫': '2',
    '割伤': '3',
    '重殴': '4',
    '精灵火': 'R'
  }
};

let 下次重殴判断 = 0;
module.exports.loop = async function({ $, cast, sleep, now, mode }) {
  let 预估剩余怒气 = $.怒气;
  const gcdReady = $.GCD < 7;
  if (gcdReady) {
    if ($.怒气 > 15) {
      if ($.裂伤 <= 0) {
        cast('裂伤');
        预估剩余怒气 -= 15;
      } else if ($.割伤 <= 40 && mode !== 'AOE') {
        cast('割伤');
        预估剩余怒气 -= 15;
      } else {
        cast('横扫');
        预估剩余怒气 -= 15;
      }
    } else if ($.精灵火 < 60) {
      cast('精灵火');
    }
  }
  if (now > 下次重殴判断 && 预估剩余怒气 > 35) {
    cast('重殴');
    下次重殴判断 = now + 800;
  }
}