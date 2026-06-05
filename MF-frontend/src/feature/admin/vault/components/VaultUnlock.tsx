import { useState } from "react";
import { Shield, ArrowRight, Lock } from "lucide-react";
import { useSetupVaultPin, useVerifyVaultPin } from "../hooks/useVault";

interface Props {
  isSetup: boolean;
  onSuccess: () => void;
  onReset?: () => void;
}

export function VaultUnlock({ isSetup, onSuccess, onReset }: Props) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const setupPin = useSetupVaultPin();
  const verifyPin = useVerifyVaultPin();

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinString = pin.join("");
    if (pinString.length !== 4) return;

    try {
      if (isSetup) {
        await setupPin.mutateAsync(pinString);
      } else {
        await verifyPin.mutateAsync(pinString);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      setPin(["", "", "", ""]);
      document.getElementById("pin-0")?.focus();
    }
  };

  const isLoading = setupPin.isPending || verifyPin.isPending;
  const error = isSetup ? setupPin.error : verifyPin.error;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            {isSetup ? (
              <Shield className="w-8 h-8 text-primary" />
            ) : (
              <Lock className="w-8 h-8 text-primary" />
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSetup ? "Setup Vault PIN" : "Unlock Vault"}
          </h2>
          <p className="text-gray-500 text-sm">
            {isSetup
              ? "Create a 4-digit PIN to secure your personal vault."
              : "Enter your 4-digit Vault PIN to access your cards and credentials."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-4">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {(error as any)?.response?.data?.message ||
                "Invalid PIN. Please try again."}
            </p>
          )}

          <button
            type="submit"
            disabled={pin.join("").length !== 4 || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : isSetup ? "Set PIN" : "Unlock"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {!isSetup && onReset && (
          <div className="mt-6 text-center">
            <button
              onClick={onReset}
              className="text-sm font-medium text-primary hover:text-primary/80"
              type="button"
            >
              Forgot Vault PIN?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
