import { alertDialog } from '@/components/app-modal';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { BuyerHeader } from '@/components/buyer-header';
import { User, Lock, MapPin, Bell, CreditCard, Shield } from 'lucide-react';

interface BuyerAccProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      first_name: string;
      last_name: string;
      contact_number?: string;
      birthday?: string;
      sex?: string;
      account_type: string;
    };
  };
}

export default function BuyerAcc({ auth }: BuyerAccProps) {
  const user = auth.user;
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [cartCount, setCartCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const profileForm = useForm({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    contact_number: user.contact_number || '',
    birthday: user.birthday || '',
    sex: user.sex || '',
  });

  // Password form
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    order_updates: true,
    promotions: false,
    new_products: true,
  });

  function handleLogout() {
    router.post('/logout');
  }

  function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    profileForm.put('/settings/profile', {
      preserveScroll: true,
      onSuccess: () => {
        alertDialog('Profile updated successfully!');
      },
      onError: (errors) => {
        console.error('Profile update errors:', errors);
        alertDialog('Failed to update profile. Please check your inputs.');
      },
    });
  }

  function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    passwordForm.put('/settings/password', {
      preserveScroll: true,
      onSuccess: () => {
        alertDialog('Password updated successfully!');
        passwordForm.reset();
      },
      onError: (errors) => {
        console.error('Password update errors:', errors);
        alertDialog('Failed to update password. Please check your inputs.');
      },
    });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alertDialog('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alertDialog('Only JPG and PNG files are allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
      const response = await fetch('/api/buyer/profile-photo', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alertDialog('Profile photo uploaded successfully!');
        // Reload to show new photo
        router.reload();
      } else {
        console.error('Upload failed:', data);
        alertDialog(`Failed to upload photo: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alertDialog(`Failed to upload photo: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setUploading(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  }

  function handleNotificationToggle(key: keyof typeof notifications) {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-[Syne]">
      <Head title="Account Settings - mimoo" />

      <BuyerHeader
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
      />

      <main className="mx-auto max-w-[1200px] px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Account Settings</h1>
          <p className="text-neutral-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    activeTab === 'profile'
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  Profile Information
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    activeTab === 'security'
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Lock className="h-5 w-5" />
                  Security
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    activeTab === 'notifications'
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-span-9">
            <div className="rounded-xl border border-neutral-200 bg-white p-8">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate}>
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">Profile Information</h2>
                  
                  <div className="space-y-6">
                    {/* Profile Photo */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Profile Photo
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-bold text-violet-700">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploading}
                          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-50"
                        >
                          {uploading ? 'Uploading...' : 'Change Photo'}
                        </button>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.data.first_name}
                          onChange={(e) => profileForm.setData('first_name', e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                        {profileForm.errors.first_name && (
                          <p className="text-xs text-red-600 mt-1">{profileForm.errors.first_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.data.last_name}
                          onChange={(e) => profileForm.setData('last_name', e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                        {profileForm.errors.last_name && (
                          <p className="text-xs text-red-600 mt-1">{profileForm.errors.last_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 bg-neutral-50"
                        disabled
                      />
                      <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.data.contact_number}
                        onChange={(e) => profileForm.setData('contact_number', e.target.value)}
                        placeholder="+63 XXX XXX XXXX"
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                      {profileForm.errors.contact_number && (
                        <p className="text-xs text-red-600 mt-1">{profileForm.errors.contact_number}</p>
                      )}
                    </div>

                    {/* Birthday */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Birthday
                        </label>
                        <input
                          type="date"
                          value={profileForm.data.birthday}
                          onChange={(e) => profileForm.setData('birthday', e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        />
                        {profileForm.errors.birthday && (
                          <p className="text-xs text-red-600 mt-1">{profileForm.errors.birthday}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Gender
                        </label>
                        <select
                          value={profileForm.data.sex}
                          onChange={(e) => profileForm.setData('sex', e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Prefer not to say</option>
                        </select>
                        {profileForm.errors.sex && (
                          <p className="text-xs text-red-600 mt-1">{profileForm.errors.sex}</p>
                        )}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={profileForm.processing}
                        className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition disabled:opacity-50"
                      >
                        {profileForm.processing ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordUpdate}>
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.data.current_password}
                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          />
                          {passwordForm.errors.current_password && (
                            <p className="text-xs text-red-600 mt-1">{passwordForm.errors.current_password}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.data.password}
                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          />
                          {passwordForm.errors.password && (
                            <p className="text-xs text-red-600 mt-1">{passwordForm.errors.password}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          />
                          {passwordForm.errors.password_confirmation && (
                            <p className="text-xs text-red-600 mt-1">{passwordForm.errors.password_confirmation}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="pt-6 border-t border-neutral-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-violet-600" />
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-600 cursor-not-allowed"
                          disabled
                        >
                          Coming Soon
                        </button>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={passwordForm.processing}
                        className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition disabled:opacity-50"
                      >
                        {passwordForm.processing ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Order Updates</h3>
                        <p className="text-sm text-neutral-600">Receive notifications about your orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.order_updates}
                          onChange={() => handleNotificationToggle('order_updates')}
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Promotions & Deals</h3>
                        <p className="text-sm text-neutral-600">Get notified about special offers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.promotions}
                          onChange={() => handleNotificationToggle('promotions')}
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">New Products</h3>
                        <p className="text-sm text-neutral-600">Stay updated with new arrivals</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications.new_products}
                          onChange={() => handleNotificationToggle('new_products')}
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-200 mt-4">
                      <button
                        onClick={() => alertDialog('Notification preferences saved!')}
                        className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
