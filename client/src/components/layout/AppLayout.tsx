import {
  BriefcaseBusiness,
  CalendarDays,
  Columns3,
  LayoutDashboard,
  Menu,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";

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
    <nav className="space-y-1" aria-label="Main navigation">
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand bg-sidebar-accent text-sidebar-accent-foreground"
                  : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={[
                    "h-4 w-4 transition-colors",
                    isActive ? "text-brand" : "group-hover:text-foreground",
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
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <Brand to="/dashboard" showTagline />
      </div>
      <Separator />
      <div className="flex-1 px-3 py-4">
        <Navigation onNavigate={onNavigate} />
      </div>
      <div className="space-y-2 border-t p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              "group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand bg-sidebar-accent text-sidebar-accent-foreground"
                : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                className={[
                  "h-4 w-4",
                  isActive ? "text-brand" : "group-hover:text-foreground",
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
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const user = data?.user;
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/88 px-4 backdrop-blur-xl supports-backdrop-filter:bg-background/75 md:px-6">
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
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent onNavigate={() => setMobileNavigationOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="lg:hidden">
              <Brand to="/dashboard" />
            </div>
          </div>

          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open account settings"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/12 text-sm font-semibold text-brand"
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
          className="min-w-0 w-full p-4 sm:p-6 xl:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
