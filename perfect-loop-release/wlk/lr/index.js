module.exports.config = {
  // 依次是每个进度条的名字
  bars: [
    'GCD',
    '印记',
    '仇恨',
    '爆炸',
    '陷阱',
    '多重',
    '杀戮',
    '误导',
    '假死',
  ],
  // 技能名称和案件的对应关系
  keyMap: {
    爆炸射击: '1',
    陷阱: '2',
    多重射击: '3',
    稳固射击: '4',
    猎人印记: 'q',
    杀戮射击: 'e',
    误导: 'r',
    假死: 't',
  },
};

module.exports.loop = async function ({ $, cast, sleep, now, mode }) {
  if ($.GCD < 90) {
    return;
  }

  if ($.仇恨 > 70 && $.误导 >= 99) {
    return cast ('误导');
  }

  if ($.印记 === 0) {
    return cast ('猎人印记');
  }

  if ($.杀戮 >= 99) {
    return cast('杀戮射击');
  }

  if ($.爆炸 >= 99) {
    return cast('爆炸射击');
  }

  if ($.陷阱 >= 99) {
    return cast('陷阱');
  }

  if ($.多重 >= 99) {
    return cast('多重射击');
  }

  if ($.仇恨 > 90 && $.假死 >= 99) {
    cast('假死');
    await sleep(1000);
    return;
  }

  if ($.爆炸 < 80 && $.陷阱 < 95 && $.多重 < 90 && $.杀戮 < 80) {
    return cast('稳固射击');
  }
};
