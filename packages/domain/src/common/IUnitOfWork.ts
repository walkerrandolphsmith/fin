/**
 * Interface representing the Unit of Work pattern.
 *
 * The Unit of Work pattern groups a set of operations that should be treated
 * atomically (as a single logical unit). Implementations typically manage
 * transactional boundaries, ensuring that either all operations succeed or the
 * system is returned to a consistent state (rollback on failure).
 *
 * In this codebase the `IUnitOfWork` exposes a single `execute` helper which
 * accepts an async callback containing the work to perform inside the unit of
 * work. Implementations can open transactions or otherwise manage resources
 * before invoking `work`, and commit/rollback as needed based on success or
 * failure.
 *
 * Example:
 * await unitOfWork.execute(async () => {
 *   await repo.create(entityA);
 *   await repo.update(entityB);
 * });
 *
 * @interface IUnitOfWork
 */
export interface IUnitOfWork {
  /**
   * Execute the provided asynchronous work inside the unit of work (transaction
   * boundary). The return value of the `work` callback is propagated to the
   * caller. If `work` throws or rejects, implementations should ensure proper
   * rollback semantics.
   *
   * @template T
   * @param {() => Promise<T>} work - Async callback that performs repository
   *   operations which should be treated as a single unit.
   * @returns {Promise<T>} The result returned from the `work` callback.
   */
  execute<T>(work: () => Promise<T>): Promise<T>;
}
