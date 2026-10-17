'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils/format';

// Categorical slots 1 and 2 of the validated chart palette (blue, orange) —
// checked for CVD separation and contrast on the white card surface.
const SERIES = [
  { key: 'sales', label: 'Sales', color: '#2a78d6' },
  { key: 'purchases', label: 'Purchases', color: '#eb6834' },
] as const;

const PLOT_HEIGHT = 200;

function monthLabel(month: string, withYear = false) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', {
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

function compactCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Sales vs purchases per month, as grouped bars on one ₹ axis. */
export function MonthlyTrendChart({
  data,
}: {
  data: { month: string; sales: number; purchases: number }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const max = Math.max(1, ...data.flatMap((d) => [d.sales, d.purchases]));
  const ticks = [1, 0.5, 0];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-600">
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden />
              {s.label}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {showTable ? (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 font-semibold">Month</th>
              <th className="py-2 text-right font-semibold">Sales</th>
              <th className="py-2 text-right font-semibold">Purchases</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((d) => (
              <tr key={d.month}>
                <td className="py-2">{monthLabel(d.month, true)}</td>
                <td className="py-2 text-right">{formatCurrency(d.sales)}</td>
                <td className="py-2 text-right">{formatCurrency(d.purchases)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex gap-3">
          {/* y-axis labels */}
          <div
            className="relative w-14 shrink-0 text-right text-[11px] text-slate-400"
            style={{ height: PLOT_HEIGHT }}
          >
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2"
                style={{ top: (1 - t) * PLOT_HEIGHT }}
              >
                {compactCurrency(max * t)}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="relative" style={{ minWidth: data.length * 44 }}>
              {/* recessive gridlines */}
              <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: PLOT_HEIGHT }}>
                {ticks.map((t) => (
                  <div
                    key={t}
                    className={t === 0 ? 'absolute inset-x-0 border-t border-slate-300' : 'absolute inset-x-0 border-t border-dashed border-slate-100'}
                    style={{ top: (1 - t) * PLOT_HEIGHT }}
                  />
                ))}
              </div>

              <div className="relative flex" style={{ height: PLOT_HEIGHT }}>
                {data.map((d, i) => (
                  <div
                    key={d.month}
                    className="relative flex flex-1 items-end justify-center gap-0.5 px-1"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    tabIndex={0}
                    aria-label={`${monthLabel(d.month, true)}: sales ${formatCurrency(d.sales)}, purchases ${formatCurrency(d.purchases)}`}
                  >
                    {hovered === i && (
                      <div className="absolute inset-0 rounded bg-slate-100/70" aria-hidden />
                    )}
                    {SERIES.map((s) => (
                      <div
                        key={s.key}
                        className="relative w-full max-w-4 rounded-t"
                        style={{
                          height: Math.max(d[s.key] > 0 ? 2 : 0, (d[s.key] / max) * PLOT_HEIGHT),
                          background: s.color,
                        }}
                      />
                    ))}
                    {hovered === i && (
                      <div
                        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md"
                        role="tooltip"
                      >
                        <p className="mb-1 font-semibold text-slate-900">{monthLabel(d.month, true)}</p>
                        {SERIES.map((s) => (
                          <p key={s.key} className="flex items-center gap-1.5 text-slate-600">
                            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} aria-hidden />
                            {s.label}
                            <span className="ml-auto pl-3 font-medium text-slate-900">
                              {formatCurrency(d[s.key])}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 flex text-center text-[11px] text-slate-500">
                {data.map((d, i) => (
                  <span key={d.month} className="flex-1">
                    {monthLabel(d.month, i === 0 || d.month.endsWith('-01'))}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
