// Curated "focus pack" templates for onboarding. Pure data — safe for
// client & server. Keys reference HABIT_COLORS / TIME_OF_DAY in habit-utils.
import type { TimeOfDay } from "@/lib/habit-utils";

export type TemplateHabit = {
  name: string;
  /** Emoji shown as the habit icon. */
  icon: string;
  /** HABIT_COLORS key (lavender|pink|green|blue|amber|teal). */
  color: string;
  timeOfDay: TimeOfDay;
  /** CSV of weekday numbers, 0=Sunday … 6=Saturday. */
  scheduleDays: string;
  restCreditsPerWeek: number;
};

export type TemplatePack = {
  key: string;
  title: string;
  emoji: string;
  tagline: string;
  habits: TemplateHabit[];
};

const WEEKDAYS = "1,2,3,4,5";
const EVERYDAY = "0,1,2,3,4,5,6";

export const TEMPLATE_PACKS: TemplatePack[] = [
  {
    key: "trader",
    title: "Discipline Trader",
    emoji: "📈",
    tagline: "Trade the plan, journal the result, protect the streak.",
    habits: [
      { name: "Pre-market analysis", icon: "📋", color: "blue", timeOfDay: "morning", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Follow the 7-step SOP before entry", icon: "✅", color: "teal", timeOfDay: "morning", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Journal every trade", icon: "📓", color: "amber", timeOfDay: "afternoon", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Backtest 30 minutes", icon: "📊", color: "blue", timeOfDay: "evening", scheduleDays: WEEKDAYS, restCreditsPerWeek: 2 },
      { name: "Meditate before session", icon: "🧘", color: "lavender", timeOfDay: "morning", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "No revenge trading today", icon: "🚫", color: "pink", timeOfDay: "anytime", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Weekly stats review", icon: "📈", color: "teal", timeOfDay: "anytime", scheduleDays: "0", restCreditsPerWeek: 1 },
    ],
  },
  {
    key: "focus",
    title: "Deep Focus",
    emoji: "🎯",
    tagline: "Guard your attention — one deep block at a time.",
    habits: [
      { name: "90-minute focus block", icon: "🎯", color: "blue", timeOfDay: "morning", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Phone off by 10:30", icon: "📵", color: "lavender", timeOfDay: "evening", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "Clean workspace", icon: "🧹", color: "teal", timeOfDay: "morning", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Read 20 minutes", icon: "📖", color: "amber", timeOfDay: "evening", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "Sleep by 11pm", icon: "🛌", color: "pink", timeOfDay: "evening", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
    ],
  },
  {
    key: "health",
    title: "Health & Energy",
    emoji: "💪",
    tagline: "Small daily moves that compound into real energy.",
    habits: [
      { name: "Morning walk", icon: "🚶", color: "green", timeOfDay: "morning", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "Drink 8 glasses of water", icon: "💧", color: "blue", timeOfDay: "anytime", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "Workout", icon: "🏋️", color: "pink", timeOfDay: "afternoon", scheduleDays: "1,3,5", restCreditsPerWeek: 1 },
      { name: "One clean meal", icon: "🥗", color: "green", timeOfDay: "anytime", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "8 hours of sleep", icon: "😴", color: "lavender", timeOfDay: "evening", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
    ],
  },
  {
    key: "morning",
    title: "Morning Person",
    emoji: "🌅",
    tagline: "Win the first hour and the rest of the day follows.",
    habits: [
      { name: "Wake up at 5:30", icon: "⏰", color: "amber", timeOfDay: "morning", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Morning stretch", icon: "☀️", color: "pink", timeOfDay: "morning", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "Plan the day", icon: "📝", color: "blue", timeOfDay: "morning", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Water before coffee", icon: "🥤", color: "teal", timeOfDay: "morning", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
    ],
  },
  {
    key: "student",
    title: "Student Mode",
    emoji: "🎓",
    tagline: "Steady study beats cramming — every single time.",
    habits: [
      { name: "Study session", icon: "📚", color: "blue", timeOfDay: "afternoon", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Review today's notes", icon: "📝", color: "lavender", timeOfDay: "evening", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
      { name: "Flashcards 15 min", icon: "🧠", color: "amber", timeOfDay: "anytime", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "Exercise break", icon: "🏃", color: "green", timeOfDay: "afternoon", scheduleDays: WEEKDAYS, restCreditsPerWeek: 1 },
    ],
  },
  {
    key: "mindful",
    title: "Calm & Mindful",
    emoji: "🧘",
    tagline: "Slow down, check in, and end the day lighter.",
    habits: [
      { name: "Meditate 10 minutes", icon: "🧘", color: "lavender", timeOfDay: "morning", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "Journal", icon: "📔", color: "amber", timeOfDay: "evening", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "One gratitude note", icon: "🙏", color: "pink", timeOfDay: "evening", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
      { name: "Evening walk", icon: "🌿", color: "green", timeOfDay: "evening", scheduleDays: EVERYDAY, restCreditsPerWeek: 1 },
    ],
  },
];
