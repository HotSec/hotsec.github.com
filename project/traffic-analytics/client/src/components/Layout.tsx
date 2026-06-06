import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Globe,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Site } from '@/types';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/sites', label: 'Sites', icon: Globe },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const { data: sites } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => apiClient.get<Site[]>('/api/sites'),
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-800 bg-gray-900 transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
          <BarChart3 className="h-7 w-7 text-primary-500" />
          <span className="text-lg font-bold text-white">Traffic Analytics</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx('sidebar-link', isActive && 'sidebar-link-active')
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600/20 text-sm font-semibold text-primary-400">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-gray-200">
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Site selector */}
            <div className="relative">
              <button
                onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 transition-colors hover:border-gray-600"
              >
                <Globe className="h-4 w-4 text-gray-400" />
                <span>{selectedSite?.name || 'Select site'}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {siteDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                  {sites?.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => {
                        setSelectedSite(site);
                        setSiteDropdownOpen(false);
                      }}
                      className={clsx(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-700',
                        selectedSite?.id === site.id
                          ? 'text-primary-400'
                          : 'text-gray-300',
                      )}
                    >
                      <Globe className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-xs text-gray-500">{site.domain}</p>
                      </div>
                    </button>
                  ))}
                  {(!sites || sites.length === 0) && (
                    <p className="px-3 py-2 text-sm text-gray-500">No sites found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
          <Outlet context={{ selectedSite }} />
        </main>
      </div>
    </div>
  );
}
