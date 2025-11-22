import { EntityNotFoundError } from "../../common/errors/EntityNotFoundError";
import { InvalidEntityIdError } from "../../common/errors/InvalidEntityIdError";
import { Bill } from "../entities/Bill";
import { IBillRepository } from "../repositories/IBillRepository";
import { BillDueNextWeekSpecification } from "../specifications/BillDueNextWeekSpecification";
import { BillDueThisWeekSpecification } from "../specifications/BillDueThisWeekSpecification";

export class BillService {
  private readonly repo: IBillRepository;

  constructor(repo: IBillRepository) {
    this.repo = repo;
  }

  async assignPaymentSource(id: string, paymentSourceId?: string) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingBill: Bill = await this.repo.getById(id);
    if (!existingBill) throw new EntityNotFoundError(id);
    if (!paymentSourceId) existingBill.unAssignPaymentSource();
    else existingBill.assignPaymentSource(paymentSourceId);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  async setDueDate(
    id: string,
    selectedDay: number,
    selectedMonth: number,
    isReoccurring?: boolean
  ) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingBill: Bill = await this.repo.getById(id);
    if (!existingBill) throw new EntityNotFoundError(id);
    const now = new Date();
    const year = now.getFullYear();
    const dueDate = new Date(year, selectedMonth, selectedDay);
    existingBill.updateDueDate(dueDate);
    existingBill.setSchedule(isReoccurring);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  async clearDueDate(id: string) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingBill: Bill = await this.repo.getById(id);
    if (!existingBill) throw new EntityNotFoundError(id);
    existingBill.updateDueDate(undefined);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  async setAmount(id: string, amount: number) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingBill: Bill = await this.repo.getById(id);
    if (!existingBill) throw new EntityNotFoundError(id);
    existingBill.changeAmount(amount);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  async renameBill(id: string, name: string) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingBill: Bill = await this.repo.getById(id);
    if (!existingBill) throw new EntityNotFoundError(id);
    existingBill.rename(name);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  async setPaymentPortalUrl(id: string, paymentPortalUrl: string | undefined) {
    if (!this.repo.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const existingBill: Bill = await this.repo.getById(id);
    if (!existingBill) throw new EntityNotFoundError(id);
    existingBill.setPaymentPortal(paymentPortalUrl);
    const saved = await this.repo.update(existingBill);
    return saved;
  }

  async reorderBills(bills: Bill[]): Promise<Bill[]> {
    const dto = bills.map((bill) => ({
      id: bill.id,
      order: bill.order,
    })) as { id: string; order: number }[];
    const updatedBills = await this.repo.reorderBills(dto);
    return updatedBills;
  }

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

  async getBillsDueThisWeek(): Promise<Bill[]> {
    const bills: Bill[] = await this.repo.getAll();
    const spec = new BillDueThisWeekSpecification();
    return bills.filter((b) => spec.isSatisfiedBy(b));
  }

  async getBillsDueNextWeek(): Promise<Bill[]> {
    const bills: Bill[] = await this.repo.getAll();
    const spec = new BillDueNextWeekSpecification();
    return bills.filter((b) => spec.isSatisfiedBy(b));
  }

  async getAllBills(): Promise<Bill[]> {
    return this.repo.getAll();
  }
}
