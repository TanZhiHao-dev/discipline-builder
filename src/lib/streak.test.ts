import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeStreaks,
  rangeStats,
  dow,
  type HabitConfig,
} from "./streak.ts";

// 2026-07-06 is a Monday (verified below). Week: Wed 07-01 … Mon 07-06.
const MON = "2026-07-06";
const SUN = "2026-07-05";
const SAT = "2026-07-04";
const FRI = "2026-07-03";
const THU = "2026-07-02";
const WED = "2026-07-01";

const everyDay: HabitConfig = {
  scheduleDays: [0, 1, 2, 3, 4, 5, 6],
  restCreditsPerWeek: 1,
};
const weekdays: HabitConfig = {
  scheduleDays: [1, 2, 3, 4, 5],
  restCreditsPerWeek: 1,
};
const done = (date: string) => ({ date, status: "done" as const });

test("date sanity: 2026-07-06 is Monday", () => {
  assert.equal(dow(MON), 1);
  assert.equal(dow(SAT), 6);
  assert.equal(dow(SUN), 0);
});

test("consecutive done days count", () => {
  const r = computeStreaks(everyDay, [done(SAT), done(SUN), done(MON)], MON);
  assert.equal(r.current, 3);
  assert.equal(r.best, 3);
});

test("a missed scheduled day breaks the streak", () => {
  const r = computeStreaks(everyDay, [done(SAT), done(MON)], MON); // SUN missing
  assert.equal(r.current, 1);
});

test("today with no record is still open (doesn't break)", () => {
  const r = computeStreaks(everyDay, [done(SUN)], MON); // MON not done yet
  assert.equal(r.current, 1); // SUN counts, SAT missing breaks before it
});

test("weekend flexibility: unscheduled days never break", () => {
  const r = computeStreaks(weekdays, [done(FRI), done(MON)], MON);
  assert.equal(r.current, 2); // Sat/Sun unscheduled → neutral
});

test("rest day within allowance protects the streak", () => {
  const r = computeStreaks(
    everyDay,
    [done(MON), { date: SUN, status: "rest" }, done(SAT)],
    MON,
  );
  assert.equal(r.current, 2); // Mon + Sat count, Sun rest preserved
});

test("rest day OVER weekly allowance breaks (cap=1)", () => {
  const r = computeStreaks(
    everyDay,
    [done(MON), { date: SUN, status: "rest" }, { date: SAT, status: "rest" }],
    MON,
  );
  // Same ISO week: earliest rest (SAT) allowed, SUN over-cap → miss → break
  assert.equal(r.current, 1);
});

test("sick / travel / pause protect without cap", () => {
  for (const s of ["sick", "travel", "pause"] as const) {
    const r = computeStreaks(
      everyDay,
      [done(MON), { date: SUN, status: s }, done(SAT)],
      MON,
    );
    assert.equal(r.current, 2, `status ${s} should protect`);
  }
});

test("best streak = longest historical run", () => {
  const r = computeStreaks(
    everyDay,
    [done(WED), done(THU), done(FRI), done(SAT), done(MON)], // SUN missing
    MON,
  );
  assert.equal(r.current, 1); // SUN miss breaks; only MON
  assert.equal(r.best, 4); // Wed→Sat
  assert.equal(r.lastDoneDate, MON);
});

test("rangeStats counts done/scheduled/protected/missed + pct", () => {
  const s = rangeStats(
    everyDay,
    [
      done(WED),
      done(THU),
      done(FRI),
      { date: SAT, status: "rest" }, // allowed
      // SUN missing → miss
    ],
    WED,
    SUN,
    MON,
  );
  assert.equal(s.scheduled, 5);
  assert.equal(s.done, 3);
  assert.equal(s.protectedCount, 1);
  assert.equal(s.missed, 1);
  assert.equal(s.pct, 60);
});
