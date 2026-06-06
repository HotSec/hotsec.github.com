import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Plus, X, Bell, BellOff } from 'lucide-react';
import type { AlertRule } from '@/types';

const METRICS = [
  { value: 'total_views', label: 'Total Views' },
  { value: 'unique_visitors', label: 'Unique Visitors' },
  { value: 'avg_duration', label: 'Average Duration' },
  { value: 'bounce_rate', label: 'Bounce Rate' },
];

const CONDITIONS = [
  { value: 'gt', label: 'Greater than' },
  { value: 'lt', label: 'Less than' },
  { value: 'eq', label: 'Equals' },
];

export default function Alerts() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formMetric, setFormMetric] = useState('total_views');
  const [formCondition, setFormCondition] = useState<'gt' | 'lt' | 'eq'>('gt');
  const [formThreshold, setFormThreshold] = useState('');

  const { data: rules, isLoading } = useQuery<AlertRule[]>({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get<AlertRule[]>('/api/alerts'),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      metric: string;
      condition: string;
      threshold: number;
    }) => apiClient.post<AlertRule>('/api/alerts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowCreateModal(false);
      setFormName('');
      setFormMetric('total_views');
      setFormCondition('gt');
      setFormThreshold('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiClient.patch<AlertRule>(`/api/alerts/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formName,
      metric: formMetric,
      condition: formCondition,
      threshold: Number(formThreshold),
    });
  };

  const getMetricLabel = (value: string) =>
    METRICS.find((m) => m.value === value)?.label || value;

  const getConditionLabel = (value: string) =>
    CONDITIONS.find((c) => c.value === value)?.label || value;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Alert Rules</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure alerts for your traffic metrics
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          New Alert
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-skeleton rounded-xl bg-gray-800"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {rules?.map((rule) => (
            <div
              key={rule.id}
              className="metric-card flex items-center gap-4"
            >
              <button
                onClick={() =>
                  toggleMutation.mutate({
                    id: rule.id,
                    enabled: !rule.enabled,
                  })
                }
                className={`rounded-lg p-2 transition-colors ${
                  rule.enabled
                    ? 'bg-accent-500/10 text-accent-500'
                    : 'bg-gray-800 text-gray-500'
                }`}
                title={rule.enabled ? 'Disable alert' : 'Enable alert'}
              >
                {rule.enabled ? (
                  <Bell className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-200">{rule.name}</h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  When{' '}
                  <span className="text-gray-400">
                    {getMetricLabel(rule.metric)}
                  </span>{' '}
                  is{' '}
                  <span className="text-gray-400">
                    {getConditionLabel(rule.condition)}
                  </span>{' '}
                  <span className="font-mono text-primary-400">
                    {rule.threshold.toLocaleString()}
                  </span>
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  rule.enabled
                    ? 'bg-accent-500/10 text-accent-400'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {rule.enabled ? 'Active' : 'Disabled'}
              </span>

              <button
                onClick={() => deleteMutation.mutate(rule.id)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                title="Delete alert"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {(!rules || rules.length === 0) && (
            <div className="rounded-xl border border-dashed border-gray-700 py-16 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">
                No alert rules configured. Create one to get notified.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Create Alert Rule
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Alert Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input-field"
                  placeholder="High traffic alert"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Metric
                </label>
                <select
                  value={formMetric}
                  onChange={(e) => setFormMetric(e.target.value)}
                  className="input-field"
                >
                  {METRICS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Condition
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) =>
                      setFormCondition(e.target.value as 'gt' | 'lt' | 'eq')
                    }
                    className="input-field"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Threshold
                  </label>
                  <input
                    type="number"
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    className="input-field"
                    placeholder="1000"
                    required
                    min="0"
                  />
                </div>
              </div>

              {createMutation.isError && (
                <p className="text-sm text-rose-400">
                  {createMutation.error?.message || 'Failed to create alert'}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
