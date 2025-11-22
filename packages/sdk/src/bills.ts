import type {
  BillDTO,
  BillFilter,
  DeleteBillResponseDTO,
  ReorderBillsResponseDTO,
} from "@fin/application";

const API_BASE = process.env.API_BASE_URL || "";

export async function getBills(filter?: BillFilter): Promise<BillDTO[]> {
  const queryParameters = filter ? `?filter=${filter}` : "";
  const res = await fetch(`${API_BASE}/api/bills${queryParameters}`);
  if (!res.ok) throw new Error("Failed to fetch bills");
  const dto = (await res.json()) as BillDTO[];
  return dto;
}

export async function createBill(data: Partial<BillDTO>): Promise<BillDTO> {
  const res = await fetch(`${API_BASE}/api/bills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bill");
  const dto = (await res.json()) as BillDTO;
  return dto;
}

export async function updateBill(
  billId: string,
  data: Partial<BillDTO>
): Promise<BillDTO> {
  const res = await fetch(`${API_BASE}/api/bills/${billId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update bill");
  const dto = (await res.json()) as BillDTO;
  return dto;
}

export async function deleteBill(
  billId: string
): Promise<DeleteBillResponseDTO> {
  const res = await fetch(`${API_BASE}/api/bills/${billId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete bill");
  const dto = (await res.json()) as DeleteBillResponseDTO;
  return dto;
}

export async function reorderBills(
  updates: { id: string; order: number }[]
): Promise<ReorderBillsResponseDTO> {
  const res = await fetch("/api/bills/reorder", {
    method: "PATCH",
    body: JSON.stringify({
      updates: updates.map((b, i) => ({ id: b.id, order: i })),
    }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to delete bill");
  const dto = (await res.json()) as ReorderBillsResponseDTO;
  return dto;
}

export async function importFrom(
  file: File | Blob | Buffer
): Promise<BillDTO> {
  const formData = new FormData();
  formData.append("file", file as any);

  const res = await fetch(`${API_BASE}/api/bills/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to import bill");
  }

  return (await res.json()) as BillDTO;
}
