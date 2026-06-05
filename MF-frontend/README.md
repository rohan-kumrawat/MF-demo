<div align="center">
  <img src="./public/brand/banner.png" alt="Guru Kripa Connect Banner" width="100%" />

  # 🌿 Guru Kripa Connect
  ### *Empowering Communities through Seamless Micro-Finance Management*

  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-Private-red)](#)

</div>

---

## 📖 Overview

**Guru Kripa Connect** is a comprehensive, enterprise-grade Micro-Finance Management System designed to streamline financial operations, loan processing, and collection management. Built with a focus on reliability, transparency, and user experience, it empowers administrators, agents, and customers with specialized tools for their unique needs.

## ✨ Key Features

### 🏢 Administrative Powerhouse
- **Comprehensive Dashboards**: Real-time insights into collections, loans, and agent performance.
- **Customer Lifecycle Management**: From onboarding to detailed financial histories.
- **Loan Management**: Sophisticated tracking of disbursements, EMI schedules, and interest.
- **Daily Register & Daybook**: Precise accounting and transaction logging.
- **Advanced Reporting**: Exportable financial reports and performance analytics.

### 👥 Agent Mobility
- **Field Collection Tools**: Easy-to-use interface for on-the-ground agents.
- **Performance Tracking**: Agents can monitor their targets and collections in real-time.
- **Customer Support**: Direct access to assigned customer profiles.

### 👤 Customer Transparency
- **Savings Diary**: Personal ledger for customers to track their contributions.
- **Loan Status**: Real-time visibility into loan balances and payment history.
- **Secure Access**: Protected portals for financial privacy.

---

## 🏗️ Architecture & Design Patterns

The project follows a **Feature-Based Architecture** designed for scalability and maintainability.

### The Three-Layer Pattern:
1.  **Page (Orchestrator)**: Handles routing and UI layout.
2.  **State Hook (`useReducer`)**: Owns business logic, derived data (`useMemo`), and stable callbacks (`useCallback`).
3.  **Service Layer**: Decouples data construction and API logic from the UI.

> [!TIP]
> For a deep dive into our architectural standards, refer to our [Feature Architecture Pattern](./docs/feature-architecture-pattern.md) documentation.

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) (Radix UI)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) & `useReducer`
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Hugeicons](https://hugeicons.com/) & [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Project Structure
```bash
src/
├── components/     # Shared UI components
├── context/        # React Context providers
├── feature/        # Business-specific feature modules (Reducers, Hooks, Services)
├── hooks/          # Reusable utility hooks
├── pages/          # Page components & Route orchestrators
├── store/          # Global state (Zustand)
└── lib/            # External library configurations
```

---

## 🔐 Role Access Matrix

| Feature | Admin | Kiosk | Agent | Customer |
| :--- | :---: | :---: | :---: | :---: |
| Admin Dashboard | ✅ | ❌ | ❌ | ❌ |
| Customer List | ✅ | ❌ | ❌ | ❌ |
| Loan Processing | ✅ | ❌ | ❌ | ❌ |
| Daily Register | ✅ | ✅ | ❌ | ❌ |
| Udhar Khata | ✅ | ✅ | ❌ | ❌ |
| Agent Dashboard | ❌ | ❌ | ✅ | ❌ |
| Customer Portal | ❌ | ❌ | ❌ | ✅ |

---

<div align="center">
  <p>Built with ❤️ by the Guru Kripa Development Team</p>
  <img src="./public/brand/logo.png" alt="Guru Kripa Logo" width="60" />
</div>
