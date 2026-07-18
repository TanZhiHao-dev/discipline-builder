import {
  sqliteTable,
  text,
  integer,
  real,
  unique,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

// Routine Stacks — group habits into blocks ("Morning routine", etc.).
export const routineStack = sqliteTable("routine_stack", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  timeOfDay: text("time_of_day").notNull().default("anytime"), // morning|afternoon|evening|anytime
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const habit = sqliteTable("habit", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("✅"), // emoji
  color: text("color").notNull().default("lavender"), // pastel accent key
  timeOfDay: text("time_of_day").notNull().default("anytime"),
  // CSV of weekday numbers this habit is scheduled (0=Sun … 6=Sat). Unscheduled
  // days never count as a miss — this drives "Weekend flexibility".
  scheduleDays: text("schedule_days").notNull().default("0,1,2,3,4,5,6"),
  stackId: text("stack_id").references(() => routineStack.id, {
    onDelete: "set null",
  }),
  // Rest Day Credit allowance: protected "rest" days permitted per ISO week.
  restCreditsPerWeek: integer("rest_credits_per_week").notNull().default(1),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// One row per habit per day.
export const checkIn = sqliteTable(
  "check_in",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    habitId: text("habit_id")
      .notNull()
      .references(() => habit.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // 'YYYY-MM-DD' (local)
    status: text("status").notNull().default("done"), // done|skip|rest|sick|travel|pause
    completedAt: integer("completed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.habitId, t.date)],
);

export type HabitRow = typeof habit.$inferSelect;
export type CheckInRow = typeof checkIn.$inferSelect;
export type RoutineStackRow = typeof routineStack.$inferSelect;

// Trading journal — one row = one 7-step SOP session / trade idea. Brought over
// from the trading-sop app so trader-focused users can log trades + backtests
// alongside their habits. mode='live' → Journal, mode='backtest' → Backtest.
export const tradeJournal = sqliteTable("trade_journal", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  asset: text("asset").notNull(), // 'XAUUSD' | 'NAS100'
  mode: text("mode").notNull().default("live"), // 'live' | 'backtest' | 'premarket'
  method: text("method").notNull().default(""),
  // For pre-market analysis rows (mode='premarket'): the trading day it covers,
  // 'YYYY-MM-DD'. One per user/date/asset. Null for live/backtest trades.
  date: text("date"),

  // --- 7-step SOP notes ---
  topDownAnalysis: text("top_down_analysis").notNull().default(""), // step 1
  dailyBias: text("daily_bias").notNull().default("Neutral"), // step 2
  marketStructure: text("market_structure").notNull().default(""), // step 3
  quarterlyTheory: text("quarterly_theory").notNull().default(""), // step 4
  pdArray: text("pd_array").notNull().default(""), // step 5

  // --- step 6: Entry ---
  entryPrice: real("entry_price"),
  stopLoss: real("stop_loss"),
  takeProfit: real("take_profit"),
  // Actual exit price (where the trade really closed) — compared against
  // takeProfit to judge plan adherence (full TP vs early/fear TP vs runner).
  exitPrice: real("exit_price"),

  // --- step 7: Set & Forget → outcome ---
  status: text("status").notNull().default("Running"), // Running|Win|Loss|Break Even
  resultR: real("result_r"), // realized result in R multiples
  resultRManual: integer("result_r_manual", { mode: "boolean" })
    .notNull()
    .default(false),
  notes: text("notes").notNull().default(""),

  // Tradezella-style review metadata
  grade: text("grade"), // execution grade A|B|C|D|F (self-rated), nullable
  tags: text("tags").notNull().default(""), // CSV of free tags, e.g. "A+ setup,news"
  playbookId: text("playbook_id"), // optional link to a named setup

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type TradeJournalRow = typeof tradeJournal.$inferSelect;

// Named trading setups / strategies ("playbooks") with rules + a pre-trade
// checklist. Trades link to a playbook so we can score each setup separately.
export const playbook = sqliteTable("playbook", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  rules: text("rules").notNull().default(""), // freeform, newline-separated
  checklist: text("checklist").notNull().default(""), // newline-separated items
  color: text("color").notNull().default("blue"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type PlaybookRow = typeof playbook.$inferSelect;

// Chart screenshots attached to a trade, tagged by which SOP step they belong
// to (so the journal detail reads as a per-step narrative: text + images).
// Stored as compressed base64 JPEG data URLs so the DB stays self-contained.
export const tradeScreenshot = sqliteTable("trade_screenshot", {
  id: text("id").primaryKey(),
  tradeId: text("trade_id")
    .notNull()
    .references(() => tradeJournal.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stepKey: text("step_key").notNull(), // topDownAnalysis|marketStructure|quarterlyTheory|pdArray|entry|notes
  image: text("image").notNull(), // data:image/jpeg;base64,...
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type TradeScreenshotRow = typeof tradeScreenshot.$inferSelect;

// ---- Money flow tracker ----

// A wallet / account holding money (cash, bank, e-wallet, savings, …).
export const wallet = sqliteTable("wallet", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  kind: text("kind").notNull().default("cash"), // cash|bank|ewallet|card|savings|investment
  color: text("color").notNull().default("green"),
  initialBalance: real("initial_balance").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// One money movement — income into or expense out of a wallet.
export const moneyTransaction = sqliteTable("money_transaction", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  walletId: text("wallet_id")
    .notNull()
    .references(() => wallet.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // income|expense
  amount: real("amount").notNull(), // always positive; `type` gives the sign
  category: text("category").notNull().default("Other"),
  note: text("note").notNull().default(""),
  date: text("date").notNull(), // 'YYYY-MM-DD' (local)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Monthly spending limit per expense category.
export const budget = sqliteTable(
  "budget",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    amount: real("amount").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.category)],
);

export type WalletRow = typeof wallet.$inferSelect;
export type MoneyTransactionRow = typeof moneyTransaction.$inferSelect;
export type BudgetRow = typeof budget.$inferSelect;

// ---- Periodic trading reviews ----
// One structured self-review per period (this week / month / year) so the trader
// evaluates their analysis + trades over time and commits to improvements.
export const periodicReview = sqliteTable(
  "periodic_review",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    period: text("period").notNull(), // weekly|monthly|yearly
    periodKey: text("period_key").notNull(), // '2026-W29' | '2026-07' | '2026'
    wentWell: text("went_well").notNull().default(""),
    wentWrong: text("went_wrong").notNull().default(""),
    improvements: text("improvements").notNull().default(""),
    notes: text("notes").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.period, t.periodKey)],
);

export type PeriodicReviewRow = typeof periodicReview.$inferSelect;

// ---- Crypto: narrative tracker + coin fundamental scores ----

// A narrative being tracked (AC Protocol narrative research). startDate + a
// typical duration drives an "age warning" when a play runs past 2-4 months.
export const cryptoNarrative = sqliteTable("crypto_narrative", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "AI", "RWA"
  quarter: text("quarter").notNull().default(""), // e.g. "2026-Q1"
  startDate: text("start_date"), // 'YYYY-MM-DD' when the play began
  durationMonths: integer("duration_months"), // null = all-year narrative
  thesis: text("thesis").notNull().default(""),
  coins: text("coins").notNull().default(""), // CSV leaders you're playing
  status: text("status").notNull().default("watching"), // watching|active|exited
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type CryptoNarrativeRow = typeof cryptoNarrative.$inferSelect;

// A saved fundamental score for a coin (6 metrics, each 0-10).
export const coinScore = sqliteTable("coin_score", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  coin: text("coin").notNull(),
  // 6 metric scores 0-10 stored as JSON {value,money,supply,founder,vc,crowd}
  scores: text("scores").notNull().default("{}"),
  conviction: integer("conviction").notNull().default(0), // # rules checked
  note: text("note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type CoinScoreRow = typeof coinScore.$inferSelect;
