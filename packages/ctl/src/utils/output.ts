import chalk from "chalk";
import Table from "cli-table3";

/**
 * Format an array of objects into a console table and print it.
 *
 * The `columns` array selects which properties to display (in order). For
 * empty results a friendly message is printed instead.
 *
 * @param {any[]} data - Array of objects to display as rows.
 * @param {string[]} columns - Ordered list of property names to include.
 * @example
 * formatTable([{ id: 'a', name: 'Acme' }], ['id','name']);
 */
export function formatTable(data: any[], columns: string[]) {
  if (data.length === 0) {
    console.log(chalk.yellow("No results found."));
    return;
  }

  const table = new Table({
    head: columns.map((col) => chalk.bold.cyan(col.toUpperCase())),
    style: {
      head: [],
      border: ["gray"],
    },
    colAligns: columns.map(() => "left" as const),
    wordWrap: true,
  });

  data.forEach((row) => {
    const rowData = columns.map((col) => {
      const value = row[col];
      return formatValue(value);
    });
    table.push(rowData);
  });

  console.log("\n" + table.toString() + "\n");
}

/**
 * Format a single value for table output.
 *
 * The function understands common domain shapes such as objects with
 * `amount`, `name`, `value`, or `id` properties and applies colorized
 * formatting for numbers and dates. It returns a string safe for inclusion
 * in the table cell.
 *
 * @param {any} value - Value to format. May be a primitive or an object.
 * @returns {string} Human-friendly string representation of the value.
 */
function formatValue(value: any): string {
  if (value?.amount !== undefined) {
    return chalk.yellow(`$${Number(value.amount).toFixed(2)}`);
  }

  if (value?.name !== undefined) return value.name;
  if (value?.value !== undefined) return value.value;
  if (value?.id !== undefined) return value.id;

  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return chalk.yellow(value.toString());
  if (value instanceof Date) return chalk.green(value.toLocaleDateString());

  return value.toString();
}

/**
 * Pretty-print JSON to stdout.
 *
 * @param {any} data - Value to JSON stringify and print.
 */
export function formatJson(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Print a success message prefixed with a green check mark.
 *
 * @param {string} message - Message to print.
 */
export function success(message: string) {
  console.log(chalk.green("✓"), message);
}

/**
 * Print an error message prefixed with a red cross to stderr.
 *
 * @param {string} message - Error message to print.
 */
export function error(message: string) {
  console.error(chalk.red("✗"), message);
}

/**
 * Print an informational message prefixed with a blue info icon.
 *
 * @param {string} message - Message to print.
 */
export function info(message: string) {
  console.log(chalk.blue("ℹ"), message);
}
