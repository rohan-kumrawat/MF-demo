import { useState } from "react";
import { X, KeyRound, Eye, EyeOff } from "lucide-react";
import type { VaultCredential } from "../types";
import {
  useCreateVaultCredential,
  useUpdateVaultCredential,
} from "../hooks/useVault";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData?: VaultCredential | null;
}

const PasswordField = ({
  label,
  value,
  onChange,
  show,
  setShow,
  placeholder,
}: any) => (
  <div className="col-span-2 sm:col-span-1">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  </div>
);

const emptyCredForm = {
  companyName: "",
  loginId: "",
  password: "",
  pinNumber: "",
  loginPassword: "",
  transactionPassword: "",
  remarks: "",
};

export function VaultCredentialModal({ isOpen, onClose, editData }: Props) {
  const [formData, setFormData] = useState(emptyCredForm);

  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showTxnPwd, setShowTxnPwd] = useState(false);

  const createCredential = useCreateVaultCredential();
  const updateCredential = useUpdateVaultCredential();

  // Track previous key in state to reset form when editData/isOpen changes
  const currentKey = `${editData?.id ?? "new"}-${isOpen}`;
  const [prevKey, setPrevKey] = useState(currentKey);

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (editData) {
      setFormData({
        companyName: editData.companyName || "",
        loginId: editData.loginId || "",
        password: editData.password || "",
        pinNumber: editData.pinNumber || "",
        loginPassword: editData.loginPassword || "",
        transactionPassword: editData.transactionPassword || "",
        remarks: editData.remarks || "",
      });
    } else {
      setFormData(emptyCredForm);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editData) {
        await updateCredential.mutateAsync({ id: editData.id, data: formData });
      } else {
        await createCredential.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = createCredential.isPending || updateCredential.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editData ? "Edit Credentials" : "Add Credentials"}
              </h2>
              <p className="text-sm text-gray-500">
                {editData
                  ? "Update vault entry"
                  : "Securely save new login credentials"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="cred-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Company / App Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. Amazon, Google"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Login ID
                </label>
                <input
                  type="text"
                  value={formData.loginId}
                  onChange={(e) =>
                    setFormData({ ...formData, loginId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Username or Email"
                />
              </div>

              <PasswordField
                label="Password"
                value={formData.password}
                onChange={(val: string) =>
                  setFormData({ ...formData, password: val })
                }
                show={showPassword}
                setShow={setShowPassword}
                placeholder="Main Password"
              />
              <PasswordField
                label="PIN Number"
                value={formData.pinNumber}
                onChange={(val: string) =>
                  setFormData({ ...formData, pinNumber: val })
                }
                show={showPin}
                setShow={setShowPin}
                placeholder="e.g. 1234"
              />
              <PasswordField
                label="Login Password"
                value={formData.loginPassword}
                onChange={(val: string) =>
                  setFormData({ ...formData, loginPassword: val })
                }
                show={showLoginPwd}
                setShow={setShowLoginPwd}
                placeholder="Alternative Login"
              />
              <PasswordField
                label="Transaction Password"
                value={formData.transactionPassword}
                onChange={(val: string) =>
                  setFormData({ ...formData, transactionPassword: val })
                }
                show={showTxnPwd}
                setShow={setShowTxnPwd}
                placeholder="For payments etc."
              />

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            form="cred-form"
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
