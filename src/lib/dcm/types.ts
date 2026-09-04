export type TenantStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";
export type SubStatus =
  | "ACTIVE"
  | "PENDING_PAYMENT"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED";
export type PayStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
export type CollectionMethod = "CASH" | "BANK_TRANSFER" | "QR_CODE" | "OTHER";

export type Tenant = {
  id: string;
  name: string;
  code: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  status: TenantStatus;
  createdAt: string;
};

export type Subscription = {
  id: string;
  tenantId: string;
  planName: string;
  price: number;
  startDate: string;
  expiryDate: string;
  status: SubStatus;
  daysRemaining: number;
};

export type Customer = {
  id: string;
  customerCode: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  status: string;
  createdAt: string;
  totalAmount: number;
  totalCount: number;
};

export type Collection = {
  id: string;
  customerId: string;
  customerName: string;
  collectionDate: string;
  amount: number;
  paymentMethod: CollectionMethod;
  collectorName: string | null;
  note: string | null;
  createdAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string | null;
  status: InvoiceStatus;
  createdAt: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string | null;
  paymentReference: string | null;
  status: PayStatus;
  note: string | null;
  createdAt: string;
};

export type AccountType = "PERSONAL_LOAN" | "BUSINESS_LOAN" | "CREDIT_LINE" | "OTHER";
export type AccountStatus =
  | "ACTIVE"
  | "OVERDUE"
  | "DELINQUENT"
  | "PAID_OFF"
  | "WRITTEN_OFF"
  | "CLOSED";
export type Classification =
  | "NORMAL"
  | "SPECIAL_MENTION"
  | "SUB_STANDARD"
  | "DOUBTFUL"
  | "LOSS";
export type InstallmentStatus =
  | "PENDING"
  | "CURRENT"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "WAIVED";

export type Account = {
  id: string;
  customerId: string;
  customerName: string;
  accountNumber: string;
  accountType: AccountType;
  originalAmount: number;
  interestRate: number;
  currency: string;
  termMonths: number | null;
  paymentFrequency: string;
  disbursementDate: string;
  firstDueDate: string | null;
  maturityDate: string | null;
  outstandingBalance: number;
  totalPaid: number;
  status: AccountStatus;
  classification: Classification | null;
  notes: string | null;
  createdAt: string;
};

export type Installment = {
  id: string;
  accountId: string;
  installmentNumber: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  dueDate: string;
  paidDate: string | null;
  amountPaid: number;
  penaltyAmount: number;
  status: InstallmentStatus;
};

export type AccountSummary = {
  totalAccounts: number;
  activeAccounts: number;
  overdueAccounts: number;
  totalOutstanding: number;
  totalOriginal: number;
  totalPaid: number;
};

export type MethodBreakdown = { method: string; amount: number; count: number };

export type DashboardData = {
  tenant: Tenant;
  tenants: Tenant[];
  subscription: Subscription;
  todayAmount: number;
  todayCount: number;
  monthAmount: number;
  monthCount: number;
  todayByMethod: MethodBreakdown[];
  recent: Collection[];
  pendingPayments: number;
  locked: boolean;
};

export type DailyReport = {
  date: string;
  totalAmount: number;
  totalCount: number;
  byMethod: MethodBreakdown[];
  items: Collection[];
};

export type MonthlyReport = {
  year: number;
  month: number;
  totalAmount: number;
  totalCount: number;
  byMethod: MethodBreakdown[];
  byDay: { date: string; amount: number; count: number }[];
  topCustomers: { name: string; amount: number; count: number }[];
};
