import { useState } from "react";
import { User, ShieldCheck, Mail, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  useChangeAdminPassword,
  useRequestEmailOtp,
  useVerifyEmailOtp,
} from "../hooks/useAdminProfile";

export function AdminProfileTab() {
  const { user } = useAuthStore();
  const { data: profile, isLoading } = useAdminProfile(user?.id);
  const updateProfile = useUpdateAdminProfile();
  const changePassword = useChangeAdminPassword();
  const requestOtp = useRequestEmailOtp();
  const verifyOtp = useVerifyEmailOtp();

  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    phone: "",
    address: "",
  });

  // Track previous profile in state to reset form when data loads
  const [prevProfile, setPrevProfile] = useState(profile);
  if (profile !== prevProfile) {
    setPrevProfile(profile);
    setProfileData({
      name: profile?.name || "",
      username: profile?.username || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    });
  }

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Email OTP Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage("");
    setProfileError("");
    if (!user?.id) return;
    try {
      await updateProfile.mutateAsync({ id: user.id, data: profileData });
      setProfileMessage("Profile updated successfully!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (error: any) {
      console.error(error);
      setProfileError(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (!user?.id) return;

    try {
      await changePassword.mutateAsync({
        id: user.id,
        data: {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
      });
      setPasswordMessage("Password changed successfully!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (error: any) {
      console.error(error);
      setPasswordError(
        error.response?.data?.message || "Failed to change password",
      );
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailMessage("");
    if (!user?.id) return;

    try {
      await requestOtp.mutateAsync({ id: user.id, newEmail });
      setOtpSent(true);
      setEmailMessage("OTP sent to your new email address!");
    } catch (error: any) {
      setEmailError(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailMessage("");
    if (!user?.id) return;

    try {
      await verifyOtp.mutateAsync({ id: user.id, otp });
      setEmailMessage("Email updated successfully!");
      setTimeout(() => {
        setIsEmailModalOpen(false);
        setOtpSent(false);
        setNewEmail("");
        setOtp("");
      }, 2000);
    } catch (error: any) {
      setEmailError(error.response?.data?.message || "Failed to verify OTP");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading profile...</div>
    );
  }

  return (
    <div className="p-6">
      {/* Internal Tabs */}
      <div className="flex border-b border-gray-100 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          General Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "security"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Security Settings
        </button>
      </div>

      <div className="max-w-xl">
        {activeTab === "general" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Profile Information
                </h2>
                <p className="text-sm text-gray-500">
                  Update your personal details
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    readOnly
                    value={profile?.email || ""}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMessage("");
                      setEmailError("");
                      setOtpSent(false);
                      setNewEmail("");
                      setOtp("");
                      setIsEmailModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Address
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-20"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-red-500">
                  {profileError}
                </span>
                <span className="text-sm font-medium text-green-600">
                  {profileMessage}
                </span>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 ml-auto"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Security Settings
                </h2>
                <p className="text-sm text-gray-500">
                  Change your login password
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-red-500">
                  {passwordError}
                </span>
                <span className="text-sm font-medium text-green-600">
                  {passwordMessage}
                </span>
                <button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50 ml-auto"
                >
                  {changePassword.isPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Email Change OTP Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Change Email
                  </h2>
                  <p className="text-sm text-gray-500">
                    Verify your new email address
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!otpSent ? (
                <form
                  id="email-otp-form"
                  onSubmit={handleRequestOtp}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. admin@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </form>
              ) : (
                <form
                  id="email-verify-form"
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Enter 6-digit OTP
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center tracking-[0.5em] font-mono text-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    OTP sent to{" "}
                    <span className="font-semibold text-gray-900">
                      {newEmail}
                    </span>
                  </p>
                </form>
              )}

              {emailError && (
                <p className="text-sm font-medium text-red-500 text-center">
                  {emailError}
                </p>
              )}
              {emailMessage && (
                <p className="text-sm font-medium text-green-600 text-center">
                  {emailMessage}
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              {!otpSent ? (
                <button
                  form="email-otp-form"
                  type="submit"
                  disabled={requestOtp.isPending || !newEmail}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {requestOtp.isPending ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <button
                  form="email-verify-form"
                  type="submit"
                  disabled={verifyOtp.isPending || otp.length < 6}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {verifyOtp.isPending ? "Verifying..." : "Verify & Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
