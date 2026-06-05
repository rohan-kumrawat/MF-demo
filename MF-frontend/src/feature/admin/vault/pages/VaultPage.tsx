import { useState } from "react";
import {
  CreditCard,
  KeyRound,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  UserCircle,
} from "lucide-react";
import {
  useVaultPinStatus,
  useVaultCards,
  useVaultCredentials,
  useDeleteVaultCard,
  useDeleteVaultCredential,
} from "../hooks/useVault";
import { VaultUnlock } from "../components/VaultUnlock";
import { VaultResetPin } from "../components/VaultResetPin";
import { VaultCardModal } from "../components/VaultCardModal";
import { VaultCredentialModal } from "../components/VaultCredentialModal";
import { AdminProfileTab } from "../components/AdminProfileTab";
import type { VaultCard, VaultCredential } from "../types";

export function VaultPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "cards" | "credentials" | "profile"
  >("cards");

  // Modal states
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<VaultCard | null>(null);
  const [editCred, setEditCred] = useState<VaultCredential | null>(null);

  // Visible passwords state for credentials table
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const { data: pinStatus, isLoading: isPinStatusLoading } =
    useVaultPinStatus();
  const { data: cards, isLoading: cardsLoading } = useVaultCards(isUnlocked);
  const { data: credentials, isLoading: credsLoading } =
    useVaultCredentials(isUnlocked);

  const deleteCard = useDeleteVaultCard();
  const deleteCred = useDeleteVaultCredential();

  if (isPinStatusLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading Vault...</div>
    );
  }

  if (isResetting) {
    return (
      <VaultResetPin
        onBack={() => setIsResetting(false)}
        onSuccess={() => setIsResetting(false)}
      />
    );
  }

  if (!isUnlocked) {
    return (
      <VaultUnlock
        isSetup={!pinStatus?.hasPin}
        onSuccess={() => setIsUnlocked(true)}
        onReset={() => setIsResetting(true)}
      />
    );
  }

  const handleDeleteCard = async (id: string) => {
    if (confirm("Are you sure you want to delete this card?")) {
      await deleteCard.mutateAsync(id);
    }
  };

  const handleDeleteCred = async (id: string) => {
    if (confirm("Are you sure you want to delete these credentials?")) {
      await deleteCred.mutateAsync(id);
    }
  };

  const togglePasswordVisibility = (credId: string, field: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [credId]: {
        ...prev[credId],
        [field]: !prev[credId]?.[field],
      },
    }));
  };

  const renderPasswordCell = (
    credId: string,
    field: string,
    value: string | null | undefined,
  ) => {
    if (!value) return <span className="text-gray-300">-</span>;
    const isVisible = visiblePasswords[credId]?.[field];

    return (
      <div className="flex items-center gap-2">
        <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-sm text-gray-700">
          {isVisible ? value : "••••••••"}
        </span>
        <button
          onClick={() => togglePasswordVisibility(credId, field)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Admin Vault
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Securely manage your cards, bills, and credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsResetting(true)}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Reset Vault PIN
          </button>
          {activeTab !== "profile" && (
            <button
              onClick={() => {
                if (activeTab === "cards") {
                  setEditCard(null);
                  setIsCardModalOpen(true);
                } else if (activeTab === "credentials") {
                  setEditCred(null);
                  setIsCredModalOpen(true);
                }
              }}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add {activeTab === "cards" ? "Card/Bill" : "Credentials"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-100 px-2">
          <button
            onClick={() => setActiveTab("cards")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "cards"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Cards & Bills
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "credentials"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Credentials
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Admin Profile
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {activeTab === "cards" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      S.No.
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Bank Name
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Card Number
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      CVV
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Exp Date
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Generate Date
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Due Date
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Bill Amount
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Remarks
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cardsLoading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-8 text-center text-gray-500"
                      >
                        Loading cards...
                      </td>
                    </tr>
                  ) : cards?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="py-12 text-center text-gray-500"
                      >
                        No cards or bills saved yet.
                      </td>
                    </tr>
                  ) : (
                    cards?.map((card, index) => (
                      <tr
                        key={card.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          {card.bankName}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                          {card.cardNumber}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                          {card.cvv || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {card.expDate || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {card.billGenerateDate || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {card.dueDate || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          {card.billAmount ? `₹${card.billAmount}` : "-"}
                        </td>
                        <td
                          className="py-4 px-6 text-sm text-gray-500 max-w-[200px] truncate"
                          title={card.remarks || ""}
                        >
                          {card.remarks || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditCard(card);
                                setIsCardModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "credentials" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      S.No.
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Company Name
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Login ID
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Password
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      PIN
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Login Pwd
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Txn Pwd
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500">
                      Remarks
                    </th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {credsLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-gray-500"
                      >
                        Loading credentials...
                      </td>
                    </tr>
                  ) : credentials?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-gray-500"
                      >
                        No credentials saved yet.
                      </td>
                    </tr>
                  ) : (
                    credentials?.map((cred, index) => (
                      <tr
                        key={cred.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          {cred.companyName}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {cred.loginId || "-"}
                        </td>
                        <td className="py-4 px-6">
                          {renderPasswordCell(
                            cred.id,
                            "password",
                            cred.password,
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {renderPasswordCell(
                            cred.id,
                            "pinNumber",
                            cred.pinNumber,
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {renderPasswordCell(
                            cred.id,
                            "loginPassword",
                            cred.loginPassword,
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {renderPasswordCell(
                            cred.id,
                            "transactionPassword",
                            cred.transactionPassword,
                          )}
                        </td>
                        <td
                          className="py-4 px-6 text-sm text-gray-500 max-w-[200px] truncate"
                          title={cred.remarks || ""}
                        >
                          {cred.remarks || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditCred(cred);
                                setIsCredModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCred(cred.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "profile" && <AdminProfileTab />}
        </div>
      </div>

      <VaultCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        editData={editCard}
      />

      <VaultCredentialModal
        isOpen={isCredModalOpen}
        onClose={() => setIsCredModalOpen(false)}
        editData={editCred}
      />
    </div>
  );
}
