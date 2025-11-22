function ListSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[32px_1fr_auto] items-center py-3 px-4 bg-gray-50 dark:bg-gray-800/60"
        >
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="ml-3">
            <div className="h-3 w-40 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
            <div className="h-2 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
          <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded justify-self-end" />
        </div>
      ))}
    </div>
  );
}

export default ListSkeleton;
