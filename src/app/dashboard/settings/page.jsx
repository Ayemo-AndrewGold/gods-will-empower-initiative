"use client";

import { User, Lock, BellRing, Shield, Eye, EyeOff, Camera } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: localStorage.getItem("fullname") || "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    policyUpdates: true,
    paymentReminders: true,
    promotionalEmails: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    twoFactorAuth: false,
  });

  const userName = localStorage.getItem("fullname");
  const nameParts = userName?.split(" ") ?? [];
  const lastName = nameParts[nameParts.length - 1];
  const initials =
    userName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase() ?? "";

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    toast.success("Notification preferences saved!");
  };

  const handleSavePrivacy = (e) => {
    e.preventDefault();
    toast.success("Privacy settings saved!");
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f8f8] font-sans flex flex-col">
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-8 py-6 overflow-y-auto">
            <h1 className="text-[23px] font-extrabold pb-2 pt-2">
              Hello {lastName}
            </h1>
            <p className="text-gray-700 text-[1.2rem] mb-6">
              Manage your <span className="font-extrabold">FCT-DCIP</span> account settings and preferences
            </p>

            {/* Settings Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex justify-around border-b border-gray-200">
                {[
                  { key: 'profile', icon: User, label: 'Profile' },
                  { key: 'security', icon: Lock, label: 'Security' },
                  { key: 'notifications', icon: BellRing, label: 'Notifications' },
                  { key: 'privacy', icon: Shield, label: 'Privacy' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2 py-3 px-4 sm:px-6 font-medium text-[1.1rem] transition-all ${
                      activeTab === key
                        ? 'text-[#028835] border-b-2 border-[#028835]'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Tabs Content */}
              <div className="p-4 md:p-8">
                {/* Profile */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSaveProfile}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
                    <div className="mb-6 flex items-center gap-6">
                      <div className="w-24 h-24 bg-[#028835] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {initials}
                      </div>
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="hidden sm:inline">Change Photo</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[1.1rem] font-medium text-gray-700 mb-2">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028835]"
                          placeholder="Street address"
                        />
                      </div>
                      <div>
                        <label className="block text-[1.1rem] font-medium text-gray-700 mb-2">Town or City</label>
                        <input
                          type="text"
                          name="townOrCity"
                          value={profileData.townOrCity}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028835]"
                          placeholder="Town or City of residence"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-6 px-6 py-3 bg-[#028835] text-white rounded-md hover:bg-[#026d2a] transition-colors text-[1.1rem] font-medium"
                    >
                      Save Changes
                    </button>
                  </form>
                )}

                {/* Security */}
                {activeTab === 'security' && (
                  <form onSubmit={handleChangePassword}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
                    <div className="max-w-md space-y-6">
                      {[
                        { label: 'Current Password', key: 'currentPassword', show: showCurrentPassword, set: setShowCurrentPassword },
                        { label: 'New Password', key: 'newPassword', show: showNewPassword, set: setShowNewPassword },
                        { label: 'Confirm New Password', key: 'confirmPassword', show: showConfirmPassword, set: setShowConfirmPassword },
                      ].map(({ label, key, show, set }) => (
                        <div key={key}>
                          <label className="block text-[1.1rem] font-medium text-gray-700 mb-2">{label}</label>
                          <div className="relative">
                            <input
                              type={show ? "text" : "password"}
                              name={key}
                              value={passwordData[key]}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028835] pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => set(!show)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="mt-6 px-6 py-3 bg-[#028835] text-[1.1rem] text-white rounded-md hover:bg-[#026d2a] transition-colors font-medium"
                    >
                      Update Password
                    </button>
                  </form>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <form onSubmit={handleSaveNotifications}>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h2>
                    {Object.entries({
                      emailNotifications: "Email Notifications",
                      pushNotifications: "Push Notifications",
                      smsNotifications: "SMS Notifications",
                      policyUpdates: "Policy Updates",
                      paymentReminders: "Payment Reminders",
                      promotionalEmails: "Promotional Emails",
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200">
                        <p className="font-medium text-gray-800 text-[1.1rem]">{label}</p>
                        <button
                          type="button"
                          onClick={() => handleNotificationToggle(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications[key] ? 'bg-[#028835]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications[key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}

                    <button
                      type="submit"
                      className="mt-6 px-6 py-3 bg-[#028835] text-[1.1rem] text-white rounded-md hover:bg-[#026d2a] transition-colors font-medium"
                    >
                      Save Preferences
                    </button>
                  </form>
                )}

                {/* Privacy */}
                {activeTab === 'privacy' && (
                  <form onSubmit={handleSavePrivacy}>
                    <h2 className="text-[1.2rem] font-semibold text-gray-800 mb-4">Privacy Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[1.1rem] font-medium text-gray-700 mb-3">Profile Visibility</label>
                        <select
                          value={privacy.profileVisibility}
                          onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#028835]"
                        >
                          <option value="private">Private</option>
                          <option value="assigned-surveyor">Assigned Surveyor</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="mt-6 px-6 py-3 bg-[#028835] text-white rounded-md hover:bg-[#026d2a] transition-colors font-medium text-[1.1rem]"
                      >
                        Save Settings
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
