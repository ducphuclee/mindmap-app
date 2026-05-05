const FREE_TIER_LIMIT = 3;

interface Props {
  count: number;
  isPro: boolean;
}

export default function UsageBadge({ count, isPro }: Props) {
  if (isPro) return null;

  const isAtLimit = count >= FREE_TIER_LIMIT;

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium ${
        isAtLimit
          ? 'bg-[rgba(255,32,71,0.15)] text-red-5'
          : 'bg-[rgba(255,255,255,0.07)] text-silver'
      }`}
    >
      {count}/{FREE_TIER_LIMIT} maps used
    </span>
  );
}
