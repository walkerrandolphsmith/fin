export interface CreateBillDTO {
  name: string;
  amount?: number;
  dueDate?: string;
  paymentPortalUrl?: string;
}
