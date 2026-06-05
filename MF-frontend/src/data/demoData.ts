// ═══════════════════════════════════════════════════════
// GURU KRIPA CONNECT — Demo Data & Types
// ═══════════════════════════════════════════════════════

export type EmiStatus = 'green' | 'yellow' | 'orange' | 'red';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  accountNo: string;
  risk: 'Low' | 'Medium' | 'High';
  agent: string;
  agentId: string;
  diaryBalance: number;
  activeLoan: number | null;
  emi: number | null;
  emiStatus: EmiStatus;
  emiLabel: string;
}

export interface Agent {
  id: string;
  name: string;
  area: string;
  customerCount: number;
  todayCollection: number;
  target: number;
  monthlyCollected: number;
  monthlyTarget: number;
  defaulters: number;
}

export interface DiaryTransaction {
  sr: number;
  date: string;
  receiptNo: string;
  mode: 'Cash' | 'UPI' | 'Cheque';
  paymentIn: number | null;
  paymentOut: number | null;
  balance: number;
}

export interface EmiScheduleItem {
  month: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'due' | 'upcoming';
  statusLabel: string;
  receiptNo: string | null;
}

export interface LedgerEntry {
  date: string;
  voucherNo: string;
  particulars: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

export interface DaybookEntry {
  date: string;
  voucherNo: string;
  particulars: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

export interface RegisterRow {
  sr: number;
  withdraw: number;
  deposit: number;
  payIn: number;
  payOut: number;
  recharge: number;
  commission: number;
  add: number;
  balance: number;
  remark: string;
}

export interface UdharEntry {
  date: string;
  liye: number | null;
  diye: number | null;
  balance: number;
  remark: string;
}

export interface Khatedar {
  id: string;
  name: string;
  phone: string;
  entries: UdharEntry[];
  netBalance: number;
}

// ───────────────────────────────────────────────────────
// SEED DATA
// ───────────────────────────────────────────────────────

export const customers: Customer[] = [
  {
    id: '1', name: 'Ramesh Kumar', phone: '9876543210', accountNo: 'GK-001',
    risk: 'Low', agent: 'Suresh Yadav', agentId: 'a1',
    diaryBalance: 8500, activeLoan: 50000, emi: 2500,
    emiStatus: 'yellow', emiLabel: 'Due in 2 days'
  },
  {
    id: '2', name: 'Sunita Devi', phone: '9765432109', accountNo: 'GK-002',
    risk: 'High', agent: 'Suresh Yadav', agentId: 'a1',
    diaryBalance: 4200, activeLoan: 30000, emi: 1800,
    emiStatus: 'red', emiLabel: '8 days overdue'
  },
  {
    id: '3', name: 'Mohan Patel', phone: '9654321098', accountNo: 'GK-003',
    risk: 'Low', agent: 'Priya Sharma', agentId: 'a2',
    diaryBalance: 12000, activeLoan: 80000, emi: 4000,
    emiStatus: 'green', emiLabel: 'Paid this month'
  },
  {
    id: '4', name: 'Geeta Sharma', phone: '9543210987', accountNo: 'GK-004',
    risk: 'Low', agent: 'Priya Sharma', agentId: 'a2',
    diaryBalance: 6500, activeLoan: null, emi: null,
    emiStatus: 'green', emiLabel: 'No active loan'
  },
  {
    id: '5', name: 'Vijay Singh', phone: '9432109876', accountNo: 'GK-005',
    risk: 'Medium', agent: 'Suresh Yadav', agentId: 'a1',
    diaryBalance: 3200, activeLoan: 20000, emi: 1200,
    emiStatus: 'orange', emiLabel: '4 days overdue'
  },
  {
    id: '6', name: 'Kavita Joshi', phone: '9321098765', accountNo: 'GK-006',
    risk: 'Low', agent: 'Priya Sharma', agentId: 'a2',
    diaryBalance: 9800, activeLoan: 40000, emi: 2200,
    emiStatus: 'green', emiLabel: 'Paid this month'
  },
];

export const agents: Agent[] = [
  {
    id: 'a1', name: 'Suresh Yadav', area: 'North Zone',
    customerCount: 3, todayCollection: 6300, target: 7500,
    monthlyCollected: 58000, monthlyTarget: 80000, defaulters: 2
  },
  {
    id: 'a2', name: 'Priya Sharma', area: 'South Zone',
    customerCount: 3, todayCollection: 4000, target: 6200,
    monthlyCollected: 42000, monthlyTarget: 65000, defaulters: 0
  },
];

export const diaryTransactions: DiaryTransaction[] = [
  { sr: 1, date: '01 Mar 2024', receiptNo: 'RCP-2024-001', mode: 'Cash', paymentIn: 3000, paymentOut: null, balance: 3000 },
  { sr: 2, date: '15 Mar 2024', receiptNo: 'RCP-2024-012', mode: 'UPI',  paymentIn: 2000, paymentOut: null, balance: 5000 },
  { sr: 3, date: '01 Apr 2024', receiptNo: 'RCP-2024-023', mode: 'Cash', paymentIn: 2000, paymentOut: null, balance: 7000 },
  { sr: 4, date: '12 Apr 2024', receiptNo: 'RCP-2024-031', mode: 'Cash', paymentIn: null, paymentOut: 500,  balance: 6500 },
  { sr: 5, date: '01 May 2024', receiptNo: 'RCP-2024-045', mode: 'Cash', paymentIn: 2000, paymentOut: null, balance: 8500 },
];

export const emiSchedule: EmiScheduleItem[] = [
  { month: 'January 2024', dueDate: '05 Jan 2024', amount: 2500, status: 'paid',     statusLabel: '✅ Paid',       receiptNo: 'EMI-2024-001' },
  { month: 'February 2024',dueDate: '05 Feb 2024', amount: 2500, status: 'paid',     statusLabel: '✅ Paid',       receiptNo: 'EMI-2024-002' },
  { month: 'March 2024',   dueDate: '05 Mar 2024', amount: 2500, status: 'paid',     statusLabel: '✅ Paid',       receiptNo: 'EMI-2024-003' },
  { month: 'April 2024',   dueDate: '05 Apr 2024', amount: 2500, status: 'due',      statusLabel: '⏳ Due in 2d',  receiptNo: null           },
  { month: 'May 2024',     dueDate: '05 May 2024', amount: 2500, status: 'upcoming', statusLabel: '— Upcoming',   receiptNo: null           },
  { month: 'June 2024',    dueDate: '05 Jun 2024', amount: 2500, status: 'upcoming', statusLabel: '— Upcoming',   receiptNo: null           },
];

export const ledgerEntries: LedgerEntry[] = [
  { date: '01 Mar 2024', voucherNo: 'RCP-2024-001', particulars: 'Diary Deposit',        debit: null,  credit: 3000, balance: 3000  },
  { date: '15 Mar 2024', voucherNo: 'RCP-2024-012', particulars: 'Diary Deposit',        debit: null,  credit: 2000, balance: 5000  },
  { date: '01 Apr 2024', voucherNo: 'EMI-2024-001', particulars: 'EMI Payment - Jan',    debit: 2500,  credit: null, balance: 2500  },
  { date: '01 Apr 2024', voucherNo: 'RCP-2024-023', particulars: 'Diary Deposit',        debit: null,  credit: 2000, balance: 4500  },
  { date: '12 Apr 2024', voucherNo: 'WD-2024-005',  particulars: 'Withdrawal',            debit: 500,   credit: null, balance: 4000  },
  { date: '01 May 2024', voucherNo: 'RCP-2024-045', particulars: 'Diary Deposit',        debit: null,  credit: 2000, balance: 6000  },
];

export const daybookEntries: DaybookEntry[] = [
  { date: '08 Apr 2026', voucherNo: 'RCP-001', particulars: 'Diary Deposit - Ramesh Kumar',   debit: null,   credit: 500,   balance: 54045 },
  { date: '08 Apr 2026', voucherNo: 'RCP-002', particulars: 'EMI Collected - Mohan Patel',     debit: null,   credit: 4000,  balance: 58045 },
  { date: '08 Apr 2026', voucherNo: 'PAY-001', particulars: 'Loan Disbursed - Kavita Joshi',   debit: 40000,  credit: null,  balance: 18045 },
  { date: '08 Apr 2026', voucherNo: 'PAY-002', particulars: 'Office Expense',                   debit: 500,    credit: null,  balance: 17545 },
  { date: '08 Apr 2026', voucherNo: 'RCP-003', particulars: 'Interest Income',                  debit: null,   credit: 4400,  balance: 21945 },
  { date: '08 Apr 2026', voucherNo: 'PAY-003', particulars: 'Salary - Suresh Yadav',           debit: 8000,   credit: null,  balance: 13945 },
];

export const registerRows: RegisterRow[] = [
  { sr: 1,  withdraw: 0,     deposit: 500,   payIn: 0,    payOut: 0,     recharge: 99,  commission: 5,    add: 0,     balance: 53952, remark: 'Jio Mahipal Recharge' },
  { sr: 2,  withdraw: 0,     deposit: 4000,  payIn: 0,    payOut: 0,     recharge: 0,   commission: 0,    add: 0,     balance: 57952, remark: 'EMI - Mohan Patel' },
  { sr: 3,  withdraw: 20000, deposit: 0,     payIn: 0,    payOut: 0,     recharge: 0,   commission: 0,    add: 0,     balance: 37952, remark: 'PAPA KO DIYE 20000' },
  { sr: 4,  withdraw: 0,     deposit: 2500,  payIn: 0,    payOut: 0,     recharge: 0,   commission: 0,    add: 0,     balance: 40452, remark: 'EMI - Ramesh Kumar' },
  { sr: 5,  withdraw: 0,     deposit: 0,     payIn: 5000, payOut: 0,     recharge: 0,   commission: 0,    add: 0,     balance: 45452, remark: 'Cash received from bank' },
  { sr: 6,  withdraw: 0,     deposit: 0,     payIn: 0,    payOut: 500,   recharge: 0,   commission: 0,    add: 0,     balance: 44952, remark: 'Office stationary' },
  { sr: 7,  withdraw: 0,     deposit: 1200,  payIn: 0,    payOut: 0,     recharge: 150, commission: 8,    add: 0,     balance: 46010, remark: 'Airtel - Vijay Singh' },
  { sr: 8,  withdraw: 0,     deposit: 2200,  payIn: 0,    payOut: 0,     recharge: 0,   commission: 0,    add: 0,     balance: 48210, remark: 'EMI - Kavita Joshi' },
  { sr: 9,  withdraw: 0,     deposit: 0,     payIn: 0,    payOut: 8000,  recharge: 0,   commission: 0,    add: 0,     balance: 40210, remark: 'Salary - Suresh Yadav' },
  { sr: 10, withdraw: 0,     deposit: 0,     payIn: 0,    payOut: 0,     recharge: 199, commission: 12,   add: 0,     balance: 40023, remark: 'BSNL broadband' },
  { sr: 11, withdraw: 0,     deposit: 500,   payIn: 0,    payOut: 0,     recharge: 0,   commission: 0,    add: 0,     balance: 40523, remark: 'Diary - Geeta Sharma' },
];

export const khatedars: Khatedar[] = [
  {
    id: 'k1', name: 'Sunil Bhai', phone: '9811223344',
    netBalance: 3000,
    entries: [
      { date: '01 Mar 2024', liye: 5000, diye: null,  balance: 5000,  remark: 'Diya tha unhe' },
      { date: '15 Mar 2024', liye: null, diye: 1000,  balance: 4000,  remark: 'Wapas liya' },
      { date: '01 Apr 2024', liye: null, diye: 1000,  balance: 3000,  remark: 'Partial return' },
    ]
  },
  {
    id: 'k2', name: 'Meena Didi', phone: '9922334455',
    netBalance: 3000,
    entries: [
      { date: '10 Feb 2024', liye: 4000, diye: null,  balance: 4000,  remark: 'Urgent zaroorat' },
      { date: '20 Mar 2024', liye: null, diye: 1000,  balance: 3000,  remark: 'Partial payment' },
    ]
  },
  {
    id: 'k3', name: 'Rajesh Sharma', phone: '9733445566',
    netBalance: -2500,
    entries: [
      { date: '05 Jan 2024', liye: null, diye: 3000,  balance: -3000, remark: 'Inka paisa tha' },
      { date: '28 Feb 2024', liye: 500,  diye: null,  balance: -2500, remark: 'Thoda wapas kiya' },
    ]
  },
];

// ───────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ───────────────────────────────────────────────────────

export function formatRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function getStatusColor(status: EmiStatus): string {
  const map: Record<EmiStatus, string> = {
    green: 'status-green',
    yellow: 'status-yellow',
    orange: 'status-orange',
    red: 'status-red',
  };
  return map[status];
}

export function getStatusBorderColor(status: EmiStatus): string {
  const map: Record<EmiStatus, string> = {
    green:  'border-l-[#006c49]',
    yellow: 'border-l-[#d97706]',
    orange: 'border-l-[#c2410c]',
    red:    'border-l-[#ba1a1a]',
  };
  return map[status];
}

export function getStatusDotColor(status: EmiStatus): string {
  const map: Record<EmiStatus, string> = {
    green:  'bg-[#006c49]',
    yellow: 'bg-[#d97706]',
    orange: 'bg-[#c2410c]',
    red:    'bg-[#ba1a1a]',
  };
  return map[status];
}

export function getAvatarColor(name: string): string {
  const colors = [
    '#001e40', '#006c49', '#1e4d8c', '#7c3aed', '#b45309', '#0e7490'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function generateReceiptNo(): string {
  return `RCP-${Date.now().toString().slice(-6)}`;
}

// Auto-generate diary transactions for customers without real data
export function getCustomerDiaryTransactions(customerId: string): DiaryTransaction[] {
  if (customerId === '1') return diaryTransactions;
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return [];
  const balance = customer.diaryBalance;
  return [
    { sr: 1, date: '01 Jan 2024', receiptNo: `RCP-${customerId}001`, mode: 'Cash', paymentIn: Math.round(balance * 0.4), paymentOut: null, balance: Math.round(balance * 0.4) },
    { sr: 2, date: '01 Feb 2024', receiptNo: `RCP-${customerId}002`, mode: 'UPI',  paymentIn: Math.round(balance * 0.35), paymentOut: null, balance: Math.round(balance * 0.75) },
    { sr: 3, date: '01 Mar 2024', receiptNo: `RCP-${customerId}003`, mode: 'Cash', paymentIn: Math.round(balance * 0.25), paymentOut: null, balance },
  ];
}

// Auto-generate EMI schedule for customers without real plan
export function getCustomerEmiSchedule(customerId: string): EmiScheduleItem[] {
  if (customerId === '1') return emiSchedule;
  const months = ['January 2024','February 2024','March 2024','April 2024','May 2024','June 2024'];
  const customer = customers.find(c => c.id === customerId);
  if (!customer || !customer.emi) return [];
  return months.map((m, i) => ({
    month: m,
    dueDate: `05 ${m}`,
    amount: customer.emi!,
    status: i < 3 ? 'paid' : i === 3 ? (customer.emiStatus !== 'green' ? 'due' : 'paid') : 'upcoming',
    statusLabel: i < 3 ? '✅ Paid' : i === 3 ? (customer.emiStatus !== 'green' ? `⏳ ${customer.emiLabel}` : '✅ Paid') : '— Upcoming',
    receiptNo: i < 3 ? `EMI-${customerId}-00${i + 1}` : null,
  }));
}

export const loanRemaining: Record<string, number> = {
  '1': 35000, '2': 21600, '3': 64000, '5': 15200, '6': 34000
};

export const weeklyCollection = [
  { day: 'Mon', amount: 8200 },
  { day: 'Tue', amount: 12500 },
  { day: 'Wed', amount: 6800 },
  { day: 'Thu', amount: 9300 },
  { day: 'Fri', amount: 11200 },
  { day: 'Sat', amount: 7600 },
  { day: 'Sun', amount: 6400 },
];

export const reportData = {
  receipts: [
    { receiptNo: 'RCP-001', from: 'Ramesh Kumar', amount: 500, mode: 'Cash' },
    { receiptNo: 'RCP-002', from: 'Mohan Patel',  amount: 4000, mode: 'UPI' },
  ],
  payments: [
    { voucherNo: 'PAY-001', to: 'Kavita Joshi (Loan)',  amount: 40000, mode: 'Cash' },
    { voucherNo: 'PAY-002', to: 'Office Expense',        amount: 500,   mode: 'Cash' },
  ],
  defaulters: [
    { name: 'Sunita Devi', daysOverdue: 8, amountDue: 1800, risk: 'red' as EmiStatus, agent: 'Suresh Yadav' },
    { name: 'Vijay Singh', daysOverdue: 4, amountDue: 1200, risk: 'orange' as EmiStatus, agent: 'Suresh Yadav' },
  ],
  profit: {
    interestIncome: 4400,
    interestExpense: 680,
    netProfit: 3720,
  }
};
