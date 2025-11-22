import { BillFilter } from "@fin/application";

function Filters({ setFilter, filter }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {[
        { key: "dueThisWeek", label: "Due This Week", value: "dueThisWeek" },
        { key: "dueNextWeek", label: "Due Next Week", value: "dueNextWeek" },
        { key: "all", label: "All", value: undefined },
      ].map((option) => (
        <button
          key={option.key}
          onClick={() => setFilter(option.value as BillFilter)}
          className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150
          ${
            filter === option.value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default Filters;
