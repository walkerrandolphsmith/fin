import chalk from "chalk";
import Table from "cli-table3";

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

export function formatJson(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

export function success(message: string) {
  console.log(chalk.green("✓"), message);
}

export function error(message: string) {
  console.error(chalk.red("✗"), message);
}

export function info(message: string) {
  console.log(chalk.blue("ℹ"), message);
}
