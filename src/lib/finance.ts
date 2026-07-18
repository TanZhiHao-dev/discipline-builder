// Money-tracker metadata + helpers. Pure — safe to import from client.

export const CURRENCY = "IDR";

/** Format a number as Indonesian Rupiah, e.g. 1250000 → "Rp1.250.000". */
export function formatMoney(n: number, opts?: { sign?: boolean }): string {
  const sign = opts?.sign ? (n > 0 ? "+" : n < 0 ? "−" : "") : "";
  const abs = Math.abs(Math.round(n));
  return `${sign}Rp${abs.toLocaleString("id-ID")}`;
}

/** Compact format for big headline numbers, e.g. 1_200_000 → "Rp1,2 jt". */
export function formatMoneyShort(n: number): string {
  const abs = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (abs >= 1_000_000_000) return `${s}Rp${(abs / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  if (abs >= 1_000_000) return `${s}Rp${(abs / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  if (abs >= 1_000) return `${s}Rp${(abs / 1_000).toFixed(0)} rb`;
  return `${s}Rp${abs}`;
}

export type TxnType = "income" | "expense";

export type Category = { key: string; label: string; emoji: string; color: string };

// color = a habitline pastel/semantic token key used for the dot/soft classes.
export const EXPENSE_CATEGORIES: Category[] = [
  { key: "food", label: "Food & Drink", emoji: "🍜", color: "amber" },
  { key: "groceries", label: "Groceries", emoji: "🛒", color: "green" },
  { key: "transport", label: "Transport", emoji: "🚗", color: "blue" },
  { key: "bills", label: "Bills & Utilities", emoji: "🧾", color: "teal" },
  { key: "rent", label: "Rent / Housing", emoji: "🏠", color: "pink" },
  { key: "shopping", label: "Shopping", emoji: "🛍️", color: "lavender" },
  { key: "entertainment", label: "Entertainment", emoji: "🎬", color: "pink" },
  { key: "health", label: "Health", emoji: "💊", color: "green" },
  { key: "education", label: "Education", emoji: "📚", color: "blue" },
  { key: "trading", label: "Trading / Invest", emoji: "📈", color: "amber" },
  { key: "other", label: "Other", emoji: "💸", color: "lavender" },
];

export const INCOME_CATEGORIES: Category[] = [
  { key: "salary", label: "Salary", emoji: "💼", color: "green" },
  { key: "business", label: "Business", emoji: "🏪", color: "teal" },
  { key: "freelance", label: "Freelance", emoji: "🧑‍💻", color: "blue" },
  { key: "trading", label: "Trading profit", emoji: "📈", color: "amber" },
  { key: "gift", label: "Gift", emoji: "🎁", color: "pink" },
  { key: "other", label: "Other", emoji: "➕", color: "lavender" },
];

export function categoriesFor(type: TxnType): Category[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function findCategory(type: TxnType, key: string): Category {
  const list = categoriesFor(type);
  return list.find((c) => c.key === key) ?? list[list.length - 1];
}

export const WALLET_KINDS: { key: string; label: string; emoji: string }[] = [
  { key: "cash", label: "Cash", emoji: "💵" },
  { key: "bank", label: "Bank", emoji: "🏦" },
  { key: "ewallet", label: "E-wallet", emoji: "📱" },
  { key: "card", label: "Card", emoji: "💳" },
  { key: "savings", label: "Savings", emoji: "🐷" },
  { key: "investment", label: "Investment", emoji: "📊" },
];

export function walletKind(key: string) {
  return WALLET_KINDS.find((k) => k.key === key) ?? WALLET_KINDS[0];
}

// Habit pastel tokens reused for wallet accents.
export const WALLET_COLORS = ["green", "blue", "teal", "amber", "pink", "lavender"] as const;

export function catColorClasses(color: string): { dot: string; soft: string; text: string } {
  // maps to the --cat-* / semantic tokens defined in globals.css
  const map: Record<string, { dot: string; soft: string; text: string }> = {
    green: { dot: "bg-cat-green", soft: "bg-cat-green/12", text: "text-cat-green" },
    blue: { dot: "bg-cat-blue", soft: "bg-cat-blue/12", text: "text-cat-blue" },
    teal: { dot: "bg-cat-teal", soft: "bg-cat-teal/12", text: "text-cat-teal" },
    amber: { dot: "bg-cat-amber", soft: "bg-cat-amber/12", text: "text-cat-amber" },
    pink: { dot: "bg-cat-pink", soft: "bg-cat-pink/12", text: "text-cat-pink" },
    lavender: { dot: "bg-cat-lavender", soft: "bg-cat-lavender/12", text: "text-cat-lavender" },
  };
  return map[color] ?? map.lavender;
}

// ---- Financial-freedom math ----
// The user's rule: minimum capital = monthly expenses × 12 (one year of runway).
// We also surface the classic 4% "FIRE" number (25× annual expenses) as the
// true financial-independence target.
export function freedomTargets(monthlyExpense: number) {
  const annual = monthlyExpense * 12;
  return {
    monthlyExpense,
    annual,
    minCapital: annual, // monthly × 12  (user's formula)
    fireNumber: annual * 25, // 4% safe-withdrawal rule
  };
}
