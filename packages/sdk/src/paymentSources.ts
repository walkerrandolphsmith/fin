import type {
  DeletePaymentSourceResponseDTO,
  PaymentSourceDTO,
} from "@fin/application";

const API_BASE = process.env.API_BASE_URL || "";

export async function getPaymentSources(): Promise<PaymentSourceDTO[]> {
  const res = await fetch(`${API_BASE}/api/paymentSources`);
  if (!res.ok) throw new Error("Failed to fetch paymentSources");
  const dto = (await res.json()) as PaymentSourceDTO[];
  return dto;
}

export async function createPaymentSource(
  data: Partial<PaymentSourceDTO>
): Promise<PaymentSourceDTO> {
  const res = await fetch(`${API_BASE}/api/paymentSources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bill");
  const dto = (await res.json()) as PaymentSourceDTO;
  return dto;
}

export async function updatePaymentSource(
  billId: string,
  data: Partial<PaymentSourceDTO>
): Promise<PaymentSourceDTO> {
  const res = await fetch(`${API_BASE}/api/paymentSources/${billId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update bill");
  const dto = (await res.json()) as PaymentSourceDTO;
  return dto;
}

export async function deletePaymentSource(
  billId: string
): Promise<DeletePaymentSourceResponseDTO> {
  const res = await fetch(`${API_BASE}/api/paymentSources/${billId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete bill");
  const dto = (await res.json()) as DeletePaymentSourceResponseDTO;
  return dto;
}
