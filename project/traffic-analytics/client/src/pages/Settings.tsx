import { useState, type FormEvent } from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User, Lock, Key, Save, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      apiClient.patch('/api/auth/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setProfileMsg('Profile updated successfully');
      setTimeout(() => setProfileMsg(''), 3000);
    },
    onError: (err) => {
      setProfileMsg(err.message || 'Failed to update profile');
      setTimeout(() => setProfileMsg(''), 3000);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: {
      currentPassword: string;
      newPassword: string;
    }) => apiClient.post('/api/auth/change-password', data),
    onSuccess: () => {
      setPasswordMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    },
    onError: (err) => {
      setPasswordMsg(err.message || 'Failed to change password');
      setTimeout(() => setPasswordMsg(''), 3000);
    },
  });

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, email });
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match');
      setTimeout(() => setPasswordMsg(''), 3000);
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings
        </p>
      </div>

      {/* Profile Section */}
      <div className="chart-container">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary-400" />
          <h2 className="text-base font-semibold text-white">Profile</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {profileMsg && (
            <p
              className={`text-sm ${
                profileMsg.includes('success')
                  ? 'text-accent-400'
                  : 'text-rose-400'
              }`}
            >
              {profileMsg}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="btn-primary gap-2"
            >
              <Save className="h-4 w-4" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="chart-container">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary-400" />
          <h2 className="text-base font-semibold text-white">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
              minLength={8}
            />
          </div>

          {passwordMsg && (
            <p
              className={`text-sm ${
                passwordMsg.includes('success')
                  ? 'text-accent-400'
                  : 'text-rose-400'
              }`}
            >
              {passwordMsg}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn-primary gap-2"
            >
              <Lock className="h-4 w-4" />
              {changePasswordMutation.isPending
                ? 'Changing...'
                : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* API Key Section */}
      <div className="chart-container">
        <div className="flex items-center gap-3">
          <Key className="h-5 w-5 text-primary-400" />
          <h2 className="text-base font-semibold text-white">API Key</h2>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Use your API key to authenticate tracking script requests.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5">
            <code className="text-sm text-gray-400">
              {user ? `ta_${user.id.slice(0, 8)}...` : '—'}
            </code>
          </div>
          <button className="btn-secondary">Regenerate</button>
        </div>
      </div>
    </div>
  );
}
