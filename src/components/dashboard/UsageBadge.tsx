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
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        isAtLimit
          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {count}/{FREE_TIER_LIMIT} maps used
    </span>
  );
}
