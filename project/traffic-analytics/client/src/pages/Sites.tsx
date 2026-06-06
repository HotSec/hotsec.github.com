import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Plus, Copy, Check, Code, X } from 'lucide-react';
import type { Site } from '@/types';

export default function Sites() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');

  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: () => apiClient.get<Site[]>('/api/sites'),
  });

  const createSiteMutation = useMutation({
    mutationFn: (data: { name: string; domain: string }) =>
      apiClient.post<Site>('/api/sites', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setShowAddModal(false);
      setNewSiteName('');
      setNewSiteDomain('');
    },
  });

  const handleCopyTrackingId = async (trackingId: string, siteId: string) => {
    await navigator.clipboard.writeText(trackingId);
    setCopiedId(siteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSite = (e: FormEvent) => {
    e.preventDefault();
    createSiteMutation.mutate({ name: newSiteName, domain: newSiteDomain });
  };

  const getTrackingSnippet = (trackingId: string) =>
    `<script>
  (function() {
    var t = document.createElement('script');
    t.src = '${window.location.origin}/track.js';
    t.setAttribute('data-tid', '${trackingId}');
    document.head.appendChild(t);
  })();
</script>`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sites</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your tracked websites
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Site
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-skeleton rounded-xl bg-gray-800"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites?.map((site) => (
            <div
              key={site.id}
              className="metric-card flex flex-col"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{site.name}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {site.domain}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
                <Code className="h-4 w-4 shrink-0 text-gray-500" />
                <code className="flex-1 truncate text-xs text-gray-400">
                  {site.trackingId}
                </code>
                <button
                  onClick={() => handleCopyTrackingId(site.trackingId, site.id)}
                  className="shrink-0 rounded p-1 text-gray-500 transition-colors hover:bg-gray-700 hover:text-gray-300"
                  title="Copy tracking ID"
                >
                  {copiedId === site.id ? (
                    <Check className="h-4 w-4 text-accent-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-primary-400 hover:text-primary-300">
                  View tracking code
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-800 p-3 text-xs text-gray-400">
                  {getTrackingSnippet(site.trackingId)}
                </pre>
              </details>
            </div>
          ))}

          {(!sites || sites.length === 0) && (
            <div className="col-span-full rounded-xl border border-dashed border-gray-700 py-16 text-center">
              <GlobeIcon className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">
                No sites yet. Add your first site to start tracking.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add New Site</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSite} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Site Name
                </label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="input-field"
                  placeholder="My Website"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Domain
                </label>
                <input
                  type="text"
                  value={newSiteDomain}
                  onChange={(e) => setNewSiteDomain(e.target.value)}
                  className="input-field"
                  placeholder="example.com"
                  required
                />
              </div>

              {createSiteMutation.isError && (
                <p className="text-sm text-rose-400">
                  {createSiteMutation.error?.message || 'Failed to create site'}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSiteMutation.isPending}
                  className="btn-primary"
                >
                  {createSiteMutation.isPending ? 'Creating...' : 'Create Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 003 12c0-1.264.26-2.466.732-3.558"
      />
    </svg>
  );
}
