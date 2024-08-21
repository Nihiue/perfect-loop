module.exports.config = {
  // 依次是每个进度条的名字
  bars: [
    'GCD',
    '血1',
    '血2',
    '冰1',
    '冰2',
    '邪1',
    '邪2',
    '死1',
    '死2',
    '符能',
    '冰病',
    '血病',
    '号角',
    '冰雾',
    '杀戮',
    '分流',
    '铜墙',
    '增效',
    '复生',
  ],
  // 技能名称和案件的对应关系
  keyMap: {
    冰冷触摸: ['1', 'alt'],
    暗影打击: ['2', 'alt'],
    寒冬号角: ['3', 'alt'],
    铜墙铁壁: ['4', 'alt'],
    亡者复生: ['r', 'alt'],
    湮没: '1',
    冰霜打击: '2',
    凛风冲击: '3',
    鲜血打击: '4',
    传染: '5',
    活力分流: '6',
    符文武器增效: '9',
  },
};

module.exports.loop = async function ({
  $,
  cast,
  sleep,
  now,
  mode,
  setNextInterval,
}) {
  if ($.GCD < 92) {
    return;
  }

  setNextInterval(3);

  const 血符文 = $.血1 >= 99 || $.血1 >= 99;
  const 冰符文 = $.冰1 >= 99 || $.冰2 >= 99;
  const 邪符文 = $.邪1 >= 99 || $.邪2 >= 99;

  const 双死 = $.死1 >= 99 && $.死2 >= 99 && $.血1 >= 99 && $.血1 >= 99;
  const 死符文 = ($.死1 >= 99 && $.血1 >= 99) || ($.死2 >= 99 && $.血2 >= 99);

  if ($.冰病 === 0) {
    return cast('冰冷触摸');
  }

  if ($.血病 === 0) {
    return cast('暗影打击');
  }

  if ($.血病 < 33 || $.冰病 < 33) {
    if (血符文 || 死符文) {
      return cast('传染');
    }
    if ($.分流 >= 99 && ($.血病 < 20 || $.冰病 < 20)) {
      cast('活力分流');
      await sleep(50);
      return cast('传染');
    }
  }

  if ($.铜墙 >= 99) {
    cast('铜墙铁壁');
    if ($.分流 >= 99 && $.增效 >= 99) {
      await sleep(50);
      cast('活力分流');
    }
    return setNextInterval(1);;
  }

  if ($.符能 >= 85) {
    return cast('冰霜打击');
  }

  if (冰符文 && 邪符文) {
    return cast('湮没');
  }

  if (双死 && ($.分流 >= 95 || $.冰病 >= 60)) {
    return cast('湮没');
  }

  if ($.增效 >= 99 && !冰符文 && !邪符文 && $.死1 >= 99 && $.死2 >= 99) {
    return cast('符文武器增效');
  }

  if ($.符能 >= 25) {
    return cast('冰霜打击');
  }

  if ($.冰雾 > 0 && $.杀戮 === 0) {
    return cast('凛风冲击');
  }

  if (血符文) {
    return cast('鲜血打击');
  }

  if ($.号角 < 70) {
    return cast('寒冬号角');
  }

  if ($.复生 >= 99) {
    return cast('亡者复生');
  }

  setNextInterval(1);
};
