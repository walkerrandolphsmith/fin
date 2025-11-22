export interface ReorderBillDTO {
  id: string;
  order: number;
}

export interface ReorderBillsRequestDTO {
  updates: ReorderBillDTO[];
}
