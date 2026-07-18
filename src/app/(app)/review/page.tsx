import { getTrades, getPremarkets, getReviews } from "@/lib/trade-queries";
import { todayStr } from "@/lib/streak";
import { ReviewView } from "@/components/review/ReviewView";

export default async function ReviewPage() {
  const [trades, premarkets, reviews] = await Promise.all([
    getTrades("live"),
    getPremarkets(),
    getReviews(),
  ]);

  return (
    <ReviewView
      trades={trades}
      premarkets={premarkets}
      reviews={reviews}
      today={todayStr()}
    />
  );
}
