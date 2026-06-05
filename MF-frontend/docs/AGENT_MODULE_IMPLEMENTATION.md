# 👔 Agent Module — Technical Implementation Details

The Agent Module is designed as a self-contained feature within the Guru Kripa Connect ecosystem. It follows a strict **3-Layer Architectural Pattern** to ensure high performance, testability, and a clear separation of concerns.

---

## 🏗️ 1. Architecture Overview

This module is located in `src/feature/agent` and is organized as follows:

- **Service Layer (`/services`)**: Pure data handling and simulated API interactions.
- **State Layer (`/hooks`)**: Business logic, derived state, and state transitions using `useReducer`.
- **Component Layer (`/components`)**: Reusable UI units designed for mobile-first interaction.
- **Page Layer (`src/pages/agent`)**: Orchestrators that connect the feature to the application's routing.

---

## 💾 2. Data Layer (Types & Services)

### Types (`types.ts`)
The module defines five core entities:
- `AgentCustomer`: Client information including EMI status and "Savings Diary" balance.
- `PendingEmi`: A focused view of upcoming or overdue payments used on the Dashboard.
- `CollectionRecord`: The receipt data generated after a successful payment.
- `CreateCollectionDto`: The payload structure for creating new records.
- `AgentStats`: Aggregated daily metrics (collected today vs. target).

### Services (`agentService.ts`)
Handles the simulation of the backend:
- **`createCollection`**: Accepts a `CreateCollectionDto`, generates a unique `receiptNo` (e.g., `RCP-A-123456`), and returns a full `CollectionRecord`. It simulates network latency (600ms) to provide realistic UI feedback.

---

## 🧠 3. Logic Layer (Hooks)

The core "brain" of the module is split into three specialized hooks:

### `useAgentDashboard(agentId)`
- **Task**: Aggregates data for the Home screen.
- **Implementation**: Reads from `demoData.ts` (assigned customers) and `localStorage` (completed collections).
- **Derived State**: 
  - `stats`: Calculates daily totals and percentage towards the agent's target.
  - `pendingEmis`: Filters assigned customers who have "Due Soon" or "Overdue" status, sorted by urgency.

### `useAgentCollect(agentId)`
- **Task**: Manages the search-and-collect workflow.
- **Implementation**: Uses `useReducer` to manage the lifecycle of a collection (Searching → Selecting → Submitting → Success).
- **Tasks**:
  - **Filtering**: Real-time fuzzy search across name, phone, and account numbers.
  - **Persistence**: Upon successful collection, it updates the `gk_agent_collections` key in `localStorage`, making the data available to all other hooks.

### `useAgentHistory(agentId)`
- **Task**: Provides a filtered log of all transactions.
- **Implementation**: 
  - Supports `DateFilter` types: `today`, `week`, or `all`.
  - Calculates a running total for the selected time period.

---

## 🎨 4. Visual Layer (Components)

| Component | Task |
| :--- | :--- |
| `SummaryCard` | Displays high-level KPIs (e.g., "Total Clients") with vibrant gradients. |
| `ProgressBar` | Visual representation of daily target achievement with smooth animations. |
| `PendingEmiCard` | A compact row highlighting a specific client's debt status and urgency. |
| `CustomerSearchCard` | Detailed client card used in search results with a direct action button. |
| `CollectModal` | The financial hub. Handles input validation, payment mode selection, and "Diary" adjustments. |
| `ReceiptToast` | A custom `sonner` toast that provides instant feedback and sharing/printing options. |
| `HistoryRow` | A log entry optimized for readability, showing payment mode icons and receipt IDs. |

---

## 🔄 5. Task Flow: Recording a Payment

1. **Trigger**: Agent clicks "Collect" on `CustomerSearchCard`.
2. **State**: `useAgentCollect` triggers the `CollectModal` with the selected customer's data.
3. **Input**: Agent enters the amount and chooses a payment mode (Cash, UPI, or Cheque).
4. **Service**: `agentService.createCollection` is called. The button enters a "Processing" state.
5. **Persistence**: The hook saves the new `CollectionRecord` to `localStorage`.
6. **Feedback**: `showReceiptToast` displays the success message with the unique receipt number.
7. **Sync**: `useAgentDashboard` automatically re-calculates the progress bar and KPI cards because the underlying data in `localStorage` changed.

---

## 🛠️ 6. Storage Strategy

The module uses a single source of truth for local persistence:
- **Key**: `gk_agent_collections`
- **Format**: JSON array of `CollectionRecord`.
- **Relationship**: Records are linked to customers via `customerId` and to agents via `agentId`.
