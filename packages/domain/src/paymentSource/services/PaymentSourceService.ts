import { IBillRepository } from "../../bill/repositories/IBillRepository";
import { EntityNotFoundError } from "../../common/errors/EntityNotFoundError";
import { InvalidEntityIdError } from "../../common/errors/InvalidEntityIdError";
import { IUnitOfWork } from "../../common/IUnitOfWork";
import { PaymentSource } from "../entities/PaymentSource";
import { IPaymentSourceRepository } from "../repositories/IPaymentSourceRepository";
import { PaymentSourceType } from "../value-objects/PaymentSourceType";

/**
 * Domain service responsible for payment source related operations. Coordinates
 * repository interactions, domain entity mutations, and transactional unit of
 * work boundaries when performing multi-entity changes.
 */
export class PaymentSourceService {
  private readonly repo: IPaymentSourceRepository;
  private readonly billRepo: IBillRepository;
  private readonly unitOfWork: IUnitOfWork;

  /**
   * Construct the service with required repositories and a unit of work.
   *
   * @param {IPaymentSourceRepository} repo - Repository for payment sources.
   * @param {IBillRepository} billRepo - Repository for bills (used when removing sources).
   * @param {IUnitOfWork} unitOfWork - UnitOfWork used to group multi-entity operations.
   */
  constructor(
    repo: IPaymentSourceRepository,
    billRepo: IBillRepository,
    unitOfWork: IUnitOfWork
  ) {
    this.repo = repo;
    this.billRepo = billRepo;
    this.unitOfWork = unitOfWork;
  }

  /**
   * Rename an existing payment source.
   *
   * Validates the id and throws descriptive domain errors when validation
   * or retrieval fails.
   *
   * @param {string} id - Identifier of the payment source to rename.
   * @param {string} name - New display name for the payment source.
   * @returns {Promise<PaymentSource>} The persisted payment source after rename.
   * @throws {InvalidEntityIdError} When the id is not valid.
   * @throws {EntityNotFoundError} When the payment source cannot be found.
   */
  async renamePaymentSource(id: string, name: string) {
    const existingPaymentSource: PaymentSource =
      await this.getExistingPaymentSource(id);
    existingPaymentSource.rename(name);
    const saved = await this.repo.update(id, existingPaymentSource);
    return saved;
  }

  /**
   * Change the type of an existing payment source.
   *
   * @param {string} id - Identifier of the payment source to change.
   * @param {PaymentSourceType} type - New type value for the payment source.
   * @returns {Promise<PaymentSource>} The persisted payment source after the change.
   * @throws {InvalidEntityIdError} When the id is not valid.
   * @throws {EntityNotFoundError} When the payment source cannot be found.
   */
  async changeTypePaymentSource(id: string, type: PaymentSourceType) {
    const existingPaymentSource: PaymentSource =
      await this.getExistingPaymentSource(id);
    existingPaymentSource.changeType(type);
    const saved = await this.repo.update(id, existingPaymentSource);
    return saved;
  }

  /**
   * Delete a payment source and unassign it from any bills that reference it.
   *
   * The operation is executed inside the configured `IUnitOfWork` to ensure
   * that bill updates and the deletion occur together. Note: the current
   * implementation invokes `unitOfWork.execute` without awaiting its
   * completion inside this method's body; callers should assume this method
   * returns once the execution is initiated.
   *
   * @param {string} id - Identifier of the payment source to delete.
   * @returns {Promise<void>} Promise that resolves when the delete operation
   *   has been initiated (may resolve before unit of work completes depending
   *   on implementation).
   */
  async delete(id: string) {
    this.unitOfWork.execute(async () => {
      const bills = await this.billRepo.findWhere({
        field: "paymentSourceId",
        value: id,
        operator: "=",
      });

      bills.forEach((bill) => bill.unAssignPaymentSource());
      const promises = bills.map((bill) => this.billRepo.update(bill));
      await Promise.all([...promises, this.repo.delete(id)]);
    });
  }

  /**
   * Helper to validate and retrieve an existing payment source or throw a
   * descriptive error when validation or retrieval fails.
   *
   * @private
   * @param {string} id - Identifier of the payment source to fetch.
   * @returns {Promise<PaymentSource>} The retrieved payment source.
   * @throws {InvalidEntityIdError} If the id format is invalid for the repo.
   * @throws {EntityNotFoundError} If no payment source exists with the id.
   */
  private async getExistingPaymentSource(id: string): Promise<PaymentSource> {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingPaymentSource: PaymentSource = await this.repo.getById(id);
    if (!existingPaymentSource) throw new EntityNotFoundError(id);
    return existingPaymentSource;
  }
}
