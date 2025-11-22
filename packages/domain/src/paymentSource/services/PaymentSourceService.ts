import { IBillRepository } from "../../bill/repositories/IBillRepository";
import { EntityNotFoundError } from "../../common/errors/EntityNotFoundError";
import { InvalidEntityIdError } from "../../common/errors/InvalidEntityIdError";
import { IUnitOfWork } from "../../common/IUnitOfWork";
import { PaymentSource } from "../entities/PaymentSource";
import { IPaymentSourceRepository } from "../repositories/IPaymentSourceRepository";
import { PaymentSourceType } from "../value-objects/PaymentSourceType";

export class PaymentSourceService {
  private readonly repo: IPaymentSourceRepository;
  private readonly billRepo: IBillRepository;
  private readonly unitOfWork: IUnitOfWork;

  constructor(
    repo: IPaymentSourceRepository,
    billRepo: IBillRepository,
    unitOfWork: IUnitOfWork
  ) {
    this.repo = repo;
    this.billRepo = billRepo;
    this.unitOfWork = unitOfWork;
  }

  async renamePaymentSource(id: string, name: string) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);

    const existingPaymentSource: PaymentSource = await this.repo.getById(id);
    if (!existingPaymentSource) throw new EntityNotFoundError(id);

    existingPaymentSource.rename(name);
    const saved = await this.repo.update(id, existingPaymentSource);
    return saved;
  }

  async changeTypePaymentSource(id: string, type: PaymentSourceType) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);

    const existingPaymentSource: PaymentSource = await this.repo.getById(id);
    if (!existingPaymentSource) throw new EntityNotFoundError(id);

    existingPaymentSource.changeType(type);
    const saved = await this.repo.update(id, existingPaymentSource);
    return saved;
  }

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
}
