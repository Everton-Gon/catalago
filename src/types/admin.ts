export type OrderStatus =
  "pending" | "approved" | "production" | "completed" | "cancelled";
export interface AdminOrder {
  id: string;
  number: string;
  customer: string;
  phone: string;
  createdAt: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    options: Record<string, string>;
    notes: string;
  }[];
  notes: string;
  attachments: string[];
  status: OrderStatus;
  payment: "unconfirmed" | "confirmed";
  totalKind: "estimated" | "confirmed";
  history: { at: string; actor: string; message: string }[];
}
export const ORDER_LABELS: Record<OrderStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  production: "Em produção",
  completed: "Concluído",
  cancelled: "Cancelado",
};
