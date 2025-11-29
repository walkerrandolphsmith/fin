import { Command } from "commander";

/**
 * Interface for command factories.
 *
 * This interface represents the Factory design pattern: implementors are
 * responsible for constructing and returning a fully-configured
 * `commander.Command` instance. Consumers call `build()` to obtain the
 * prepared command object which can then be composed into a CLI program or
 * executed. Using a factory interface allows decoupling command construction
 * from registration and execution logic, enabling easier testing and
 * configuration injection.
 *
 * Example:
 * class MyCommand implements IBuildCommand {
 *   build(): Command {
 *     const cmd = new Command('do-thing');
 *     cmd.description('Perform a thing');
 *     return cmd;
 *   }
 * }
 */
export interface IBuildCommand {
  /**
   * Build and return a configured `commander.Command` instance.
   *
   * @returns {Command} Configured Commander command ready for registration.
   */
  build(): Command;
}
