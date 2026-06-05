import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useResetVaultPin } from "../hooks/useVault";

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export function VaultResetPin({ onBack, onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const resetPin = useResetVaultPin();

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const pin = [...newPin];
    pin[index] = value;
    setNewPin(pin);

    if (value && index < 3) {
      document.getElementById(`reset-pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !newPin[index] && index > 0) {
      document.getElementById(`reset-pin-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinString = newPin.join("");
    if (pinString.length !== 4 || !password) return;

    try {
      await resetPin.mutateAsync({ password, newPin: pinString });
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const isComplete = password && newPin.join("").length === 4;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Unlock
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Vault PIN
          </h2>
          <p className="text-gray-500 text-sm">
            Enter your account password to verify your identity, then create a
            new 4-digit PIN.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Enter your login password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
              New 4-Digit PIN
            </label>
            <div className="flex justify-center gap-4">
              {newPin.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-pin-${index}`}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              ))}
            </div>
          </div>

          {resetPin.error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {(resetPin.error as any)?.response?.data?.message ||
                "Failed to reset PIN"}
            </p>
          )}

          <button
            type="submit"
            disabled={!isComplete || resetPin.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetPin.isPending ? "Resetting..." : "Reset PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
