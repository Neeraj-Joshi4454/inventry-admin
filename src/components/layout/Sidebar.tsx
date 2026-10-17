'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Warehouse } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePendingRegistrationCountQuery } from '@/hooks/useRegistrations';
import { navItems } from './navItems';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: pendingRegistrations } = usePendingRegistrationCountQuery();

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
          <Warehouse className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">Inventry Admin</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.href === '/registrations' && !!pendingRegistrations && (
                <span
                  className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-slate-900"
                  aria-label={`${pendingRegistrations} pending`}
                >
                  {pendingRegistrations}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-500">
        Super Admin Panel
      </div>
    </div>
  );
}
