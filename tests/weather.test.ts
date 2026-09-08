import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act,
  calendar,
  deserialize,
  harvestQuality,
  newGame,
  REGION_IDS,
  REGIONS,
  serialize,
  weather,
} from '../src/game.ts';

test('regional weather varies across vintages while retaining seasonal limits', () => {
  for (const region of REGION_IDS) {
    const summers = new Set<string>();
    const temperatures = new Set<number>();
    let dryWeeks = 0;
    for (let year = 1; year <= 100; year++) {
      const summer = [];
      for (let week = 1; week <= 12; week++) {
        const absoluteWeek = (year - 1) * 12 + week;
        const sky = weather(absoluteWeek, region);
        assert.deepEqual(weather(absoluteWeek, region), sky);
        assert.ok(Number.isInteger(sky.temp));
        if (calendar(absoluteWeek).season === 'Summer') {
          assert.ok(['Sunshine', 'Dry spell'].includes(sky.name));
          summer.push(sky.name);
          dryWeeks += Number(sky.name === 'Dry spell');
          temperatures.add(sky.temp);
          const normal = 26 + (REGIONS[region].heat - 3) * 2;
          assert.ok(sky.temp >= normal - 2 && sky.temp <= normal + 5);
        } else {
          assert.notEqual(sky.name, 'Dry spell');
          if (sky.name === 'Frosty')
            assert.equal(calendar(absoluteWeek).season, 'Winter');
        }
      }
      summers.add(summer.join(','));
    }
    assert.ok(summers.size >= 6, `${region}: repeating summers`);
    assert.ok(
      temperatures.size >= 7,
      `${region}: too little temperature variation`,
    );
    assert.ok(
      dryWeeks >= 70 && dryWeeks <= 130,
      `${region}: drought frequency`,
    );
  }
  assert.ok(
    Array.from({ length: 36 }, (_, i) => i + 1).some(
      (week) =>
        weather(week, 'bordeaux').name !== weather(week, 'burgundy').name,
    ),
    'Regions should not all share the same sky',
  );
});

test('equally cared-for grapes vary modestly between vintages without raising average quality', () => {
  // Healthy, fully ripe founding grapes before the weather adjustment.
  const baseline = [74, 82, 78, 80, 78, 78, 78, 76];
  for (const [index, region] of REGION_IDS.entries()) {
    const scores = [];
    for (let year = 2; year <= 101; year++) {
      const s = newGame(region);
      s.week = (year - 1) * 12 + 6;
      const plot = { ...s.plots[0], health: 100, growth: 100 };
      const score = harvestQuality(s, plot);
      scores.push(score);
      assert.ok(Math.abs(score - baseline[index]) <= 3, `${region}: ${score}`);
      // The same fruit cannot gain a different weather score by waiting in autumn.
      for (let delay = 1; delay <= 3; delay++)
        assert.equal(
          harvestQuality({ ...s, week: s.week + delay }, plot),
          score,
        );
      assert.ok(harvestQuality(s, { ...plot, health: 70 }) <= score - 12);
    }
    const low = Math.min(...scores),
      high = Math.max(...scores);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    assert.ok(low < baseline[index] && high > baseline[index], region);
    assert.ok(high - low >= 4 && high - low <= 6, region);
    assert.ok(
      Math.abs(mean - baseline[index]) < 1,
      `${region}: average ${mean}`,
    );
  }
});

test('weather affects real harvests and care remains effective across growing seasons', () => {
  for (const region of REGION_IDS) {
    const caredScores = new Set<number>();
    for (let year = 2; year <= 21; year++) {
      let tended = newGame(region);
      tended.cash = 1e6;
      tended.week = (year - 1) * 12;
      tended.plots[0].health = 100;
      let neglected = structuredClone(tended);
      for (let week = 1; week <= 9; week++) {
        tended = act(tended, { type: 'advance' });
        neglected = act(neglected, { type: 'advance' });
        tended = act(tended, { type: 'tend', id: 1 });
      }
      const caredFruit = act(tended, { type: 'harvest', id: 1 }).grapes[0];
      const neglectedFruit = act(neglected, { type: 'harvest', id: 1 })
        .grapes[0];
      caredScores.add(caredFruit.quality);
      assert.ok(
        caredFruit.quality > neglectedFruit.quality,
        `${region}, year ${year}`,
      );
      assert.equal(caredFruit.quality, harvestQuality(tended, tended.plots[0]));
    }
    assert.ok(caredScores.size >= 4, region);
  }
});

test('reloads and unrelated actions do not reroll vintage quality or rewrite picked grapes', () => {
  let s = act(newGame(), { type: 'harvest', id: 1 });
  const picked = structuredClone(s.grapes[0]);
  s.week = 20;
  s.plots[1].growth = 100;
  const before = structuredClone(s);
  const score = harvestQuality(s, s.plots[1]);
  const loaded = deserialize(serialize(s));
  const renamed = act(loaded, { type: 'rename', name: 'Another estate name' });
  renamed.seed = 123456; // Breeding and tasting consume this stream.
  assert.equal(harvestQuality(renamed, renamed.plots[1]), score);
  assert.deepEqual(s, before);
  assert.deepEqual(loaded.grapes[0], picked);
  assert.equal(
    act(renamed, { type: 'harvest', id: 2 }).grapes[1].quality,
    score,
  );
  assert.deepEqual(
    act(loaded, { type: 'advance' }),
    act(s, { type: 'advance' }),
  );
});
