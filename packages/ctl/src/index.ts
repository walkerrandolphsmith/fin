#!/usr/bin/env node

/**
 * CLI entrypoint for the `finctl` tool.
 *
 * Responsibilities:
 * - Initialize the application's IoC container by calling `setupContainer()`
 *   so dependencies are registered and infrastructure (e.g., DB) is connected.
 * - Register command factories (e.g., `BillCommandFactory`) with the
 *   Commander program and parse CLI arguments.
 *
 * Notes:
 * - The file uses an immediately-invoked async function to allow awaiting
 *   asynchronous initialization before registering commands and parsing
 *   arguments. This ensures commands have access to a fully-initialized
 *   dependency container.
 * - The shebang at the top allows the script to be executed directly when
 *   installed as a CLI package.
 *
 * Example:
 *   finctl bill list
 */

import { setupContainer } from "@fin/ioc";
import { Command } from "commander";
import "reflect-metadata";
import { BillCommandFactory } from "./commands/billCommandFactory";

const program = new Command();

program.name("finctl").description("pkg.description").version("1.0.0");

(async () => {
  await setupContainer();
  program.addCommand(new BillCommandFactory().build());
  program.parse();
})();
