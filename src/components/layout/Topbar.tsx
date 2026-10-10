'use client';

import { useRouter } from 'next/navigation';
import { Menu, LogOut, UserCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { DropdownContent, DropdownItem, DropdownMenu, DropdownTrigger } from '@/components/ui/DropdownMenu';
import { initials } from '@/lib/utils/format';
import { useToast } from '@/components/ui/Toast';

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();

  async function handleLogout() {
    await logout();
    toast.success('Logged out successfully');
    router.replace('/login');
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <DropdownMenu>
        <DropdownTrigger className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-slate-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {user ? initials(user.name) : <UserCircle className="h-5 w-5" />}
          </span>
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {user?.name ?? 'Loading...'}
          </span>
        </DropdownTrigger>
        <DropdownContent>
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.mobileNumber}</p>
          </div>
          <DropdownItem onSelect={() => router.push('/settings')}>
            <KeyRound className="h-4 w-4" />
            Change password
          </DropdownItem>
          <DropdownItem danger onSelect={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownItem>
        </DropdownContent>
      </DropdownMenu>
    </header>
  );
}
