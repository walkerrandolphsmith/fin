/**
 * Interface representing the Specification pattern.
 *
 * The Specification pattern encapsulates a piece of domain logic that can be
 * used to test whether an object satisfies a particular business rule.
 * Specifications are composable and can be reused across the domain and
 * application layers. Concrete implementations implement `isSatisfiedBy` to
 * express the rule, allowing callers to remain decoupled from the rule's
 * implementation details.
 *
 * Responsibilities:
 * - Encapsulate a single business rule as a reusable object.
 * - Provide a boolean predicate (`isSatisfiedBy`) that tests an entity.
 * - Be usable in collection filtering, orchestration, or composition.
 *
 * Example:
 * class BillDueThisWeekSpecification implements ISpecification<Bill> {
 *   isSatisfiedBy(bill: Bill): boolean { ... }
 * }
 *
 * Then used like:
 * const spec = new BillDueThisWeekSpecification();
 * const due = bills.filter(b => spec.isSatisfiedBy(b));
 *
 * @template T The type of entity the specification tests.
 */
export interface ISpecification<T> {
  /**
   * Test whether the provided entity satisfies the specification.
   *
   * @param {T} entity - The entity to test.
   * @returns {boolean} True when the entity satisfies the rule, false otherwise.
   */
  isSatisfiedBy(entity: T): boolean;
}
