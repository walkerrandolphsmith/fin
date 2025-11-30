import { EntityNotFoundError } from "../../common/errors/EntityNotFoundError";
import { InvalidEntityIdError } from "../../common/errors/InvalidEntityIdError";
import { Bill } from "../entities/Bill";
import { IBillRepository } from "../repositories/IBillRepository";
import { BillDueNextWeekSpecification } from "../specifications/BillDueNextWeekSpecification";
import { BillDueThisWeekSpecification } from "../specifications/BillDueThisWeekSpecification";

/**
 * Application/domain service responsible for orchestrating bill-related
 * operations that involve repository access and domain behavior.
 *
 * The service does not perform persistence itself but coordinates entity
 * retrieval, mutation and persistence via the injected `IBillRepository`.
 */
export class BillService {
  private readonly repo: IBillRepository;

  /**
   * Construct the BillService with a repository implementation.
   *
   * @param {IBillRepository} repo - Repository used to load and persist bills.
   * @example
   * const svc = new BillService(myBillRepository);
   */
  constructor(repo: IBillRepository) {
    this.repo = repo;
  }

  /**
   * Assign or remove a payment source for a bill.
   *
   * Validates the provided bill id and throws `InvalidEntityIdError` when the
   * id is not valid. If the bill cannot be found, an `EntityNotFoundError` is
   * thrown. If `paymentSourceId` is undefined the payment source is removed.
   *
   * @param {string} id - The id of the bill to update.
   * @param {string | undefined} paymentSourceId - The id of the payment source
   *   to assign, or undefined to unassign.
   * @returns {Promise<Bill>} The saved Bill after persistence.
   * @throws {InvalidEntityIdError} If the provided id is not valid for the repo.
   * @throws {EntityNotFoundError} If no bill exists with the given id.
   */
  async assignPaymentSource(id: string, paymentSourceId?: string) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingBill: Bill = await this.repo.getById(id);
    if (!existingBill) throw new EntityNotFoundError(id);
    if (!paymentSourceId) existingBill.unAssignPaymentSource();
    else existingBill.assignPaymentSource(paymentSourceId);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  /**
   * Set the due date for a bill using day and month values and optionally set
   * whether it should be recurring.
   *
   * The method constructs a due date for the current year from the provided
   * day and month values, updates the bill and persists the change.
   *
   * @param {string} id - The bill id to update.
   * @param {number} selectedDay - Day number (0-31 depending on month).
   * @param {number} selectedMonth - Month index (0-11) to construct the date.
   * @param {boolean} [isReoccurring] - Optional flag to mark the bill recurring.
   * @returns {Promise<Bill>} The persisted bill after update.
   */
  async setDueDate(
    id: string,
    selectedDay: number,
    selectedMonth: number,
    isReoccurring?: boolean
  ) {
    const existingBill = await this.getExistingBill(id);
    const now = new Date();
    const year = now.getFullYear();
    const dueDate = new Date(year, selectedMonth, selectedDay);
    existingBill.updateDueDate(dueDate);
    existingBill.setSchedule(isReoccurring);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  /**
   * Clear the due date for a bill and persist the change.
   *
   * @param {string} id - The bill id to clear.
   * @returns {Promise<Bill>} The persisted bill after clearing the due date.
   */
  async clearDueDate(id: string) {
    const existingBill = await this.getExistingBill(id);
    existingBill.updateDueDate(undefined);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  /**
   * Change the amount of a bill and persist the change.
   *
   * @param {string} id - The bill id to update.
   * @param {number} amount - New numeric amount for the bill.
   * @returns {Promise<Bill>} The persisted bill after the amount change.
   */
  async setAmount(id: string, amount: number) {
    const existingBill = await this.getExistingBill(id);
    existingBill.changeAmount(amount);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  /**
   * Rename a bill and persist the change.
   *
   * @param {string} id - The bill id to rename.
   * @param {string} name - New name for the bill.
   * @returns {Promise<Bill>} The persisted bill after rename.
   */
  async renameBill(id: string, name: string) {
    const existingBill = await this.getExistingBill(id);
    existingBill.rename(name);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  /**
   * Set or clear the payment portal URL for a bill and persist the change.
   *
   * @param {string} id - The bill id to update.
   * @param {string | undefined} paymentPortalUrl - URL or undefined to clear.
   * @returns {Promise<Bill>} The persisted bill after the update.
   */
  async setPaymentPortalUrl(id: string, paymentPortalUrl: string | undefined) {
    const existingBill = await this.getExistingBill(id);
    existingBill.setPaymentPortal(paymentPortalUrl);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  /**
   * Set or clear the payment portal URL for a bill and persist the change.
   *
   * @param {string} id - The bill id to update.
   * @param {boolean} hasFixedAmount - True if the bill has a fixed amount.
   * @returns {Promise<Bill>} The persisted bill after the update.
   */
  async setAmountType(id: string, hasFixedAmount: boolean) {
    const existingBill = await this.getExistingBill(id);
    existingBill.setAmountType(hasFixedAmount);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  /**
   * Reorder a list of bills by delegating to the repository's batch reorder
   * operation. The service maps the Bill entities to the id/order DTO expected
   * by the repository.
   *
   * @param {Bill[]} bills - Array of Bill entities in the desired order.
   * @returns {Promise<Bill[]>} The updated bills after persistence.
   */
  async reorderBills(bills: Bill[]): Promise<Bill[]> {
    const dto = bills.map((bill) => ({
      id: bill.id,
      order: bill.order,
    })) as { id: string; order: number }[];
    const updatedBills = await this.repo.reorderBills(dto);
    return updatedBills;
  }

  /**
   * Unassign a payment source from all bills which reference it.
   *
   * This method queries the repository for bills referencing the provided
   * paymentSourceId, clears the relation on each bill and persists them.
   *
   * @param {string} paymentSourceId - The id of the payment source to remove.
   * @returns {Promise<(Bill | null)[]>} Array of results from repository updates.
   */
  async unassignPaymentSource(
    paymentSourceId: string
  ): Promise<(Bill | null)[]> {
    const bills = await this.repo.findWhere({
      field: "paymentSourceId",
      value: paymentSourceId,
      operator: "=",
    });

    bills.forEach((bill) => bill.unAssignPaymentSource());
    return Promise.all(bills.map((bill) => this.repo.update(bill)));
  }

  /**
   * Retrieve bills that are due this week using a domain specification.
   *
   * @returns {Promise<Bill[]>} Bills matching the "due this week" specification.
   */
  async getBillsDueThisWeek(): Promise<Bill[]> {
    const bills: Bill[] = await this.repo.getAll();
    const spec = new BillDueThisWeekSpecification();
    return bills.filter((b) => spec.isSatisfiedBy(b));
  }

  /**
   * Retrieve bills that are due next week using a domain specification.
   *
   * @returns {Promise<Bill[]>} Bills matching the "due next week" specification.
   */
  async getBillsDueNextWeek(): Promise<Bill[]> {
    const bills: Bill[] = await this.repo.getAll();
    const spec = new BillDueNextWeekSpecification();
    return bills.filter((b) => spec.isSatisfiedBy(b));
  }

  /**
   * Return all bills from storage.
   *
   * @returns {Promise<Bill[]>} All persisted bills.
   */
  async getAllBills(): Promise<Bill[]> {
    return this.repo.getAll();
  }

  /**
   * Helper that validates an id, fetches the bill, and throws descriptive
   * errors when validation or retrieval fails. Used by many public methods to
   * avoid duplication of the common retrieval pattern.
   *
   * @private
   * @param {string} id - The bill id to fetch.
   * @returns {Promise<Bill>} The existing bill.
   * @throws {InvalidEntityIdError} If id fails validation.
   * @throws {EntityNotFoundError} If no bill exists with the given id.
   */
  private async getExistingBill(id: string): Promise<Bill> {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingBill: Bill = await this.repo.getById(id);
    if (!existingBill) throw new EntityNotFoundError(id);
    return existingBill;
  }
}
