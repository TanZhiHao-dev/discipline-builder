import {
  getWallets,
  getBudgets,
  getMonthSummary,
  getTransactions,
} from "@/lib/money-queries";
import { todayStr } from "@/lib/streak";
import { MoneyBoard } from "@/components/money/MoneyBoard";

export default async function MoneyPage() {
  const today = todayStr(); // 'YYYY-MM-DD'
  const month = today.slice(0, 7); // 'YYYY-MM'
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const to = `${month}-${String(daysInMonth).padStart(2, "0")}`;

  const [wallets, summary, transactions, budgets] = await Promise.all([
    getWallets(),
    getMonthSummary(month),
    getTransactions(`${month}-01`, to),
    getBudgets(),
  ]);

  const netWorth = wallets.reduce((s, w) => s + w.balance, 0);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <MoneyBoard
      wallets={wallets}
      summary={summary}
      transactions={transactions}
      budgets={budgets}
      netWorth={netWorth}
      monthLabel={monthLabel}
    />
  );
}
