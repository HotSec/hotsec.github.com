import type { GeoData } from '@/types';

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  DE: '🇩🇪',
  FR: '🇫🇷',
  JP: '🇯🇵',
  CN: '🇨🇳',
  IN: '🇮🇳',
  BR: '🇧🇷',
  CA: '🇨🇦',
  AU: '🇦🇺',
  KR: '🇰🇷',
  RU: '🇷🇺',
  IT: '🇮🇹',
  ES: '🇪🇸',
  NL: '🇳🇱',
  SE: '🇸🇪',
  MX: '🇲🇽',
  SG: '🇸🇬',
  ID: '🇮🇩',
  PL: '🇵🇱',
};

function getFlag(countryCode: string): string {
  return COUNTRY_FLAGS[countryCode.toUpperCase()] || '🌍';
}

interface GeoMapProps {
  data: GeoData[] | undefined;
  loading?: boolean;
}

export default function GeoMap({ data, loading }: GeoMapProps) {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="h-5 w-32 animate-skeleton rounded bg-gray-700" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-8 animate-skeleton rounded bg-gray-700" />
              <div className="h-4 w-20 animate-skeleton rounded bg-gray-700" />
              <div className="h-4 w-12 animate-skeleton rounded bg-gray-700" />
              <div className="h-3 flex-1 animate-skeleton rounded-full bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxViews = Math.max(...(data || []).map((d) => d.views), 1);

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-gray-200">Geographic Distribution</h3>
      <div className="mt-4 space-y-3">
        {(data || []).map((item) => (
          <div key={item.country} className="flex items-center gap-3">
            <span className="w-7 text-center text-lg">
              {getFlag(item.country)}
            </span>
            <span className="w-24 truncate text-sm text-gray-300">
              {item.country}
            </span>
            <span className="w-16 text-right text-sm tabular-nums text-gray-400">
              {item.views.toLocaleString()}
            </span>
            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{
                    width: `${(item.views / maxViews) * 100}%`,
                  }}
                />
              </div>
            </div>
            <span className="w-12 text-right text-xs tabular-nums text-gray-500">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <p className="py-8 text-center text-sm text-gray-500">
            No geographic data available
          </p>
        )}
      </div>
    </div>
  );
}
