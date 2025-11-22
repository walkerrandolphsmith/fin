#!/usr/bin/env node

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
