import { getNarratives, getCoinScores } from "@/server/crypto";
import { todayStr } from "@/lib/streak";
import { CryptoWorkspace } from "@/components/crypto/CryptoWorkspace";

export default async function CryptoPage() {
  const [narratives, coinScores] = await Promise.all([
    getNarratives(),
    getCoinScores(),
  ]);
  return (
    <CryptoWorkspace
      narratives={narratives}
      coinScores={coinScores}
      today={todayStr()}
    />
  );
}
