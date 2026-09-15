import {
  BriefcaseBusiness,
  CalendarDays,
  LayoutDashboard,
  Menu,
  Settings,
  Columns3,
} from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { LogoutButton } from "@/features/auth/LogoutButton";
import { useCurrentUser } from "@/features/auth/useCurrentUser";
import { SkipLink } from "@/components/common/SkipLink";
import { Brand } from "@/components/brand/Brand";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Applications",
    path: "/applications",
    icon: BriefcaseBusiness,
  },
  {
    name: "Board",
    path: "/board",
    icon: Columns3,
  },
  {
    name: "Calendar",
    path: "/calendar",
    icon: CalendarDays,
  },
];

function Navigation() {
  return (
    <nav className="space-y-1" aria-label="Main navigation">
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />

            {item.name}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <Brand to="/dashboard" showTagline />
      </div>

      <Separator />

      <div className="flex-1 px-3 py-4">
        <Navigation />
      </div>

      <div className="space-y-2 border-t p-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")
          }
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Settings
        </NavLink>

        <LogoutButton />
      </div>
    </div>
  );
}

export function AppLayout() {
  const { data } = useCurrentUser();

  const user = data?.user;
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      <SkipLink />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-sidebar md:block">
        <SidebarContent />
      </aside>

      <div className="md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation"
                  />
                }
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </SheetTrigger>

              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="md:hidden">
              <Brand to="/dashboard" />
            </div>
          </div>

          {/* <div className="text-right">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>

            <p className="hidden text-xs text-muted-foreground sm:block">
              {user?.email}
            </p>
          </div> */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              {initials || "U"}
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
