import { getHabits, getStacks } from "@/lib/queries";
import { HabitsManager } from "@/components/habits/HabitsManager";

export default async function HabitsPage() {
  const [habits, stacks] = await Promise.all([getHabits(), getStacks()]);
  return (
    <HabitsManager
      habits={habits}
      stacks={stacks.map((s) => ({ id: s.id, name: s.name, timeOfDay: s.timeOfDay }))}
    />
  );
}
