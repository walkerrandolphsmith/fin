import { IParseBillDocument } from "@fin/bill-parser";
import { BillService } from "@fin/domain";
import { BillRepository } from "@fin/infrastructure";
import { container, TOKENS } from "@fin/ioc";
import chalk from "chalk";
import { Command } from "commander";
import { readFile } from "fs/promises";
import ora from "ora";
import { formatTable } from "../utils/output.js";
import { IBuildCommand } from "./IBuildCommand";

export class BillCommandFactory implements IBuildCommand {
  build() {
    const billCommand = new Command("bill").description("Manage bills");
    billCommand
      .command("list")
      .description("List all bills")
      .option("-w, --where <filter>", 'Filter bills (e.g., "dueThisWeek")')
      .option("-f, --format <format>", "Output format (table|json)", "table")
      .action(async (options) => {
        const spinner = ora("Loading bills...").start();

        try {
          const billService = container.resolve<BillService>(
            TOKENS.BillDomainService
          );
          const billRepository = container.resolve<BillRepository>(
            TOKENS.BillRepository
          );
          let bills;
          if (options.where === "dueThisWeek") {
            bills = await billService.getBillsDueThisWeek();
          } else {
            bills = await billService.getAllBills();
          }

          spinner.succeed(`Found ${bills.length} bills`);

          if (options.format === "json") {
            console.log(JSON.stringify(bills, null, 2));
          } else {
            formatTable(bills, [
              "id",
              "name",
              "amount",
              "dueDate",
              "paymentSourceId",
              "paymentPortal",
            ]);
          }
          await billRepository.dispose();
          process.exit(0);
        } catch (error) {
          spinner.fail("Failed to load bills");
          console.error(chalk.red("Error:"), (error as Error).message);
          process.exit(1);
        }
      });

    billCommand
      .command("show <id>")
      .description("Show bill details")
      .option("-f, --format <format>", "Output format (table|json)", "table")
      .action(async (id, options) => {
        const spinner = ora("Loading bill...").start();

        try {
          const billRepository = container.resolve<BillRepository>(
            TOKENS.BillRepository
          );
          const bill = await billRepository.getById(id);

          spinner.succeed("Bill loaded");

          if (options.format === "json") {
            console.log(JSON.stringify(bill, null, 2));
          }
          if (options.format === "table") {
            console.log(chalk.bold("\nBill Details:"));
            console.log(chalk.gray("─".repeat(50)));
            console.log(`${chalk.cyan("ID:")}              ${bill.id}`);
            console.log(`${chalk.cyan("Name:")}            ${bill.name.name}`);
            console.log(
              `${chalk.cyan("Amount:")}          $${bill.amount.amount}`
            );
            console.log(`${chalk.cyan("Due Date:")}        ${bill.dueDate}`);
            console.log(
              `${chalk.cyan("Payment Source:")}  ${bill.paymentSourceId?.id}`
            );
            console.log(
              `${chalk.cyan("Payment Site:")}    ${bill.paymentPortal?.value}`
            );
          }
          await billRepository.dispose();
          process.exit(0);
        } catch (error) {
          spinner.fail("Failed to load bill");
          console.error(chalk.red("Error:"), (error as Error).message);
          process.exit(1);
        }
      });

    billCommand
      .command("parse <path>")
      .description("Parse bill details from pdf file")
      .action(async (path, options) => {
        const spinner = ora("Loading bill...").start();
        try {
          const pdfBuffer = await readFile(path);
          const parser = container.resolve<IParseBillDocument>(
            TOKENS.BillParser
          );
          const result = await parser.parse(pdfBuffer);
          spinner.succeed("Document parsed");
          console.log(JSON.stringify(result, null, 2));
          process.exit(0);
        } catch (error) {
          spinner.fail("Failed to load bill");
          console.error(chalk.red("Error:"), (error as Error).message);
          process.exit(1);
        }
      });
    return billCommand;
  }
}
