import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Columns3,
  LayoutDashboard,
  BookOpenCheck,
  Menu,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";

import "@/workspace.css";

import { Brand } from "@/components/brand/Brand";
import { SkipLink } from "@/components/common/SkipLink";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { useCurrentUser } from "@/features/auth/useCurrentUser";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Applications", path: "/applications", icon: BriefcaseBusiness },
  { name: "Board", path: "/board", icon: Columns3 },
  { name: "Calendar", path: "/calendar", icon: CalendarDays },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="workspace-navigation space-y-1" aria-label="Main navigation">
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "workspace-nav-active"
                  : "workspace-nav-inactive",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={[
                    "h-4 w-4 transition-colors",
                    isActive ? "text-[#9be2ca]" : "group-hover:text-white",
                  ].join(" ")}
                  aria-hidden="true"
                />
                {item.name}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="workspace-sidebar flex h-full flex-col">
      <div className="workspace-sidebar-brand px-5 pb-7 pt-6">
        <Brand to="/dashboard" showTagline inverse />
      </div>
      <Separator className="opacity-15" />
      <div className="flex-1 px-3 py-5">
        <p className="workspace-nav-label px-3 pb-3">Workspace</p>
        <Navigation onNavigate={onNavigate} />

        <div className="workspace-prep-panel mt-8">
          <div className="workspace-prep-icon" aria-hidden="true"><BookOpenCheck className="h-5 w-5" /></div>
          <p className="workspace-prep-kicker">Next conversation</p>
          <p className="workspace-prep-title">Make your story count.</p>
          <p className="workspace-prep-copy">Keep your notes, questions and practice in one place.</p>
          <a
            href="/prep/"
            onClick={onNavigate}
            className="workspace-prep-link group flex items-center justify-between rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9be2ca]"
          >
            Interview prep
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="workspace-sidebar-footer space-y-1 border-t p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
              isActive
                ? "workspace-nav-active"
                : "workspace-nav-inactive",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                className={[
                  "h-4 w-4",
                  isActive ? "text-[#9be2ca]" : "group-hover:text-white",
                ].join(" ")}
                aria-hidden="true"
              />
              Settings
            </>
          )}
        </NavLink>
        <LogoutButton />
      </div>
    </div>
  );
}

export function AppLayout() {
  const { data } = useCurrentUser();
  const { pathname } = useLocation();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const user = data?.user;
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
  const section = pathname.startsWith("/applications")
    ? "Applications"
    : pathname === "/board"
      ? "Board"
      : pathname === "/calendar"
        ? "Calendar"
        : pathname === "/settings"
          ? "Settings"
          : "Dashboard";

  return (
    <div className="workspace-shell min-h-screen">
      <SkipLink />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-68">
        <header className="workspace-header sticky top-0 z-20 flex h-17 items-center justify-between px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open navigation"
                  />
                }
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="left" className="w-68 border-0 p-0">
                <SidebarContent onNavigate={() => setMobileNavigationOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="lg:hidden">
              <Brand to="/dashboard" />
            </div>
            <div className="hidden items-center gap-2.5 text-sm sm:flex lg:ml-1">
              <span className="workspace-location-dot" aria-hidden="true" />
              <span className="text-muted-foreground">Workspace</span>
              <span className="text-muted-foreground/45" aria-hidden="true">/</span>
              <span className="font-semibold">{section}</span>
            </div>
          </div>

          <Link
            to="/settings"
            className="workspace-account flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open account settings"
          >
            <div
              className="workspace-account-avatar flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
              aria-hidden="true"
            >
              {initials || "U"}
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="max-w-56 truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </Link>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="workspace-main min-w-0 w-full p-4 sm:p-6 xl:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
