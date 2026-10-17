import {
  LayoutDashboard,
  Building2,
  Package,
  Boxes,
  ShoppingCart,
  Truck,
  BarChart3,
  ScrollText,
  Settings,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Businesses', href: '/businesses', icon: Building2 },
  { label: 'Registrations', href: '/registrations', icon: UserPlus },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Inventory', href: '/inventory', icon: Boxes },
  { label: 'Sales', href: '/sales', icon: ShoppingCart },
  { label: 'Purchases', href: '/purchases', icon: Truck },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Audit Logs', href: '/audit-logs', icon: ScrollText },
  { label: 'Settings', href: '/settings', icon: Settings },
];
