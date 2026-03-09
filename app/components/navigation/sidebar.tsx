'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Produtos', href: '/products', icon: Package },
  { label: 'Movimentações', href: '/movements', icon: ArrowRightLeft },
  { label: 'Relatórios', href: '/reports', icon: BarChart3 },
  { label: 'Alertas', href: '/alerts', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Package className="h-6 w-6 text-blue-600 mr-2" />
        <h1 className="text-lg font-bold text-gray-900">InventoryHub</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            pathname === '/settings'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
