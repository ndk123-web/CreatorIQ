import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import logo from '../assets/logo.png';
import {
  LayoutDashboard,
  TrendingUp,
  Lightbulb,
  Calendar,
  BarChart2,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/app/dashboard' },
  { name: 'Trends', icon: TrendingUp, href: '/app/trends' },
  { name: 'Strategy', icon: Lightbulb, href: '/app/strategy' },
  { name: 'Planner', icon: Calendar, href: '/app/planner' },
  { name: 'Analytics', icon: BarChart2, href: '/app/analytics' },
];

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
      collapsed && 'justify-center px-2',
      isActive
        ? 'bg-gradient-to-r from-brand-600/30 via-brand-600/20 to-brand-600/5 text-white shadow-md shadow-brand-900/30 border border-brand-500/30'
        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
    );

  return (
    <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3.5 py-5 custom-scrollbar">
      <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        Workspace Navigation
      </div>
      {navItems.map((item) => (
        <NavLink key={item.href} to={item.href} className={linkClass} onClick={onNavigate}>
          {({ isActive }) => (
            <>
              <item.icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-brand-400" : "text-neutral-400")} />
              {!collapsed && <span className="tracking-tight">{item.name}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-400 shadow-xs shadow-brand-400" />
              )}
            </>
          )}
        </NavLink>
      ))}
      <div className="mt-auto border-t border-white/10 pt-4">
        <NavLink to="/app/settings" className={linkClass} onClick={onNavigate}>
          {({ isActive }) => (
            <>
              <Settings className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-brand-400" : "text-neutral-400")} />
              {!collapsed && <span className="tracking-tight">Settings</span>}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

export const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="app-shell flex min-h-screen bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-neutral-800/60 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white shadow-2xl shadow-neutral-950/50 lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-md shadow-brand-900/20 ring-2 ring-brand-500/20">
            <img src={logo} alt="CreatorIQ" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-sora text-base font-bold tracking-tight text-white">
              Creator<span className="text-brand-400">IQ</span>
            </span>
            <span className="text-[10px] font-medium text-neutral-400 tracking-wider uppercase">AI Trend Engine</span>
          </div>
        </div>
        <SidebarNav />
        <div className="border-t border-white/10 p-3.5">
          <button
            type="button"
            onClick={() => useAuthStore.getState().logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-neutral-950 text-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                  <img src={logo} alt="CreatorIQ" className="h-full w-full object-contain" />
                </div>
                <span className="font-sora text-base font-bold text-white">CreatorIQ</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <div className="border-t border-white/10 p-3.5">
              <button
                type="button"
                onClick={() => useAuthStore.getState().logout()}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="app-main flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200/80 surface-glass px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden min-w-0 flex-1 sm:block sm:w-80">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  placeholder="Quick search trends, topics, niche concepts..."
                  className="h-10 w-full rounded-xl border border-neutral-200/90 bg-neutral-100/70 pl-10 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative rounded-xl border border-neutral-200/80 bg-white p-2.5 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 shadow-2xs transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
            </button>
            <div className="hidden items-center gap-3 sm:flex border-l border-neutral-200/80 pl-3">
              <div className="text-right">
                <p className="text-xs font-bold text-neutral-900 leading-tight">
                  {user?.full_name ?? 'Creator Account'}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500 font-medium">{user?.email ?? ''}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-sm ring-2 ring-brand-100">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4.5 w-4.5" />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="surface-app flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
