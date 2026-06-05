import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  TableProperties,
  Receipt,
  UserCheck,
  MonitorCheck,
  History,
  Shield,
} from "lucide-react";
import type { ElementType } from "react";

export interface NavItem {
  icon: ElementType;
  label: string;
  sublabel: string;
  path: string;
}

export const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    sublabel: "डैशबोर्ड",
    path: "/admin",
  },
  {
    icon: Users,
    label: "Customers",
    sublabel: "ग्राहक",
    path: "/admin/customers",
  },
  {
    icon: BookOpen,
    label: "Savings Diary",
    sublabel: "बचत डायरी",
    path: "/admin/diary",
  },
  { icon: CreditCard, label: "Loans", sublabel: "ऋण", path: "/admin/loans" },
  // {
  //   icon: Wallet,
  //   label: "Collection",
  //   sublabel: "संग्रह",
  //   path: "/admin/collection",
  // },
  // {
  //   icon: FileText,
  //   label: "Daybook",
  //   sublabel: "दैनिक बही",
  //   path: "/admin/daybook",
  // },
  {
    icon: TableProperties,
    label: "Daily Register",
    sublabel: "रोज़नामचा",
    path: "/admin/daily-register",
  },
  {
    icon: Receipt,
    label: "Udhar Khata",
    sublabel: "उधार खाता",
    path: "/admin/udhar-khata",
  },
  {
    icon: UserCheck,
    label: "Agents",
    sublabel: "एजेंट",
    path: "/admin/agents",
  },
  {
    icon: MonitorCheck,
    label: "Kiosk Users",
    sublabel: "कियोस्क",
    path: "/admin/kiosk-users",
  },
  {
    icon: History,
    label: "Transaction History",
    sublabel: "लेन-देन इतिहास",
    path: "/admin/transactions",
  },
  {
    icon: Shield,
    label: "Admin Vault",
    sublabel: "तिजोरी",
    path: "/admin/vault",
  },
  // {
  //   icon: BarChart3,
  //   label: "Reports",
  //   sublabel: "रिपोर्ट",
  //   path: "/admin/reports",
  // },
];

export const kioskNavItems: NavItem[] = [
  {
    icon: TableProperties,
    label: "Daily Register",
    sublabel: "रोज़नामचा",
    path: "/kiosk/daily-register",
  },
  {
    icon: Receipt,
    label: "Udhar Khata",
    sublabel: "उधार खाता",
    path: "/kiosk/udhar-khata",
  },
];

export const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Admin / डैशबोर्ड" },
  "/admin/customers": { title: "Customers", subtitle: "Admin / ग्राहक" },
  "/admin/diary": { title: "Savings Diary", subtitle: "Admin / बचत डायरी" },
  "/admin/loans": { title: "Loans", subtitle: "Admin / ऋण" },
  "/admin/loans/create": { title: "New Loan", subtitle: "Admin / नया ऋण" },
  "/admin/loans/collection-report": {
    title: "Collections Report",
    subtitle: "Admin / संग्रह रिपोर्ट",
  },
  // "/admin/collection": { title: "Collection", subtitle: "Admin / संग्रह" },
  // "/admin/daybook": { title: "Daybook", subtitle: "Admin / दैनिक बही" },
  "/admin/daily-register": {
    title: "Daily Register",
    subtitle: "Admin / रोज़नामचा",
  },
  "/admin/udhar-khata": { title: "Udhar Khata", subtitle: "Admin / उधार खाता" },
  "/admin/udhar-khata/detail": {
    title: "Khatedar Detail",
    subtitle: "Admin / उधार खाता",
  },
  "/admin/agents": { title: "Agents", subtitle: "Admin / एजेंट" },
  "/admin/kiosk-users": {
    title: "Kiosk Users",
    subtitle: "Admin / कियोस्क उपयोगकर्ता",
  },
  "/admin/transactions": {
    title: "Transaction History",
    subtitle: "Admin / लेन-देन इतिहास",
  },
  "/admin/vault": { title: "Admin Vault", subtitle: "Admin / तिजोरी" },
  // "/admin/reports": { title: "Reports", subtitle: "Admin / रिपोर्ट" },
  "/kiosk/daily-register": {
    title: "Daily Register",
    subtitle: "Kiosk / रोज़नामचा",
  },
  "/kiosk/udhar-khata": { title: "Udhar Khata", subtitle: "Kiosk / उधार खाता" },
  "/kiosk/udhar-khata/detail": {
    title: "Khatedar Detail",
    subtitle: "Kiosk / उधार खाता",
  },
};

export const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  kiosk: "Kiosk",
  agent: "Agent",
  customer: "Customer",
};

export const ROLE_INITIALS: Record<string, string> = {
  admin: "AD",
  kiosk: "KI",
  agent: "AG",
  customer: "CU",
};

/** Returns the deepest matching key for nested routes, including dynamic segments. */
export function resolvePageKey(pathname: string): string {
  const match = Object.keys(pageTitles)
    .filter((k) => pathname === k || pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];
  if (match) return match;
  const parent = pathname.replace(/\/[^/]+$/, "");
  return parent ? resolvePageKey(parent) : pathname;
}
