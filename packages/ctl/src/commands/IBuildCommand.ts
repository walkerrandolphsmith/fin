import { Command } from "commander";

export interface IBuildCommand {
  build(): Command;
}
