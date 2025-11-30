export interface BillDTO {
  id: string;
  name: string;
  amount?: number;
  dueDate?: string;
  order: number;
  paymentSourceId?: string;
  isReoccurring?: boolean;
  paymentPortalUrl?: string;
  hasFixedAmount?: boolean;
}
