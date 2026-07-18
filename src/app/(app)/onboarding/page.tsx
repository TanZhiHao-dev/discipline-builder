import { requireUser } from "@/lib/session";
import { getHabits } from "@/lib/queries";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  await requireUser();
  const habits = await getHabits();

  return (
    <OnboardingFlow
      existingHabitCount={habits.length}
      existingHabitNames={habits.map((h) => h.name)}
    />
  );
}
