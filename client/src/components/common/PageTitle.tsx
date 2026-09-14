import { useEffect } from "react";

import { useLocation } from "react-router";

export function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    let title = "RoleNaviq";

    if (pathname === "/dashboard") {
      title = "Dashboard | RoleNaviq";
    } else if (pathname === "/applications/new") {
      title = "Add Application | RoleNaviq";
    } else if (
      pathname.includes("/edit") &&
      pathname.startsWith("/applications/")
    ) {
      title = "Edit Application | RoleNaviq";
    } else if (pathname.startsWith("/applications/")) {
      title = "Application Details | RoleNaviq";
    } else if (pathname === "/applications") {
      title = "Applications | RoleNaviq";
    } else if (pathname === "/board") {
      title = "Board | RoleNaviq";
    } else if (pathname === "/calendar") {
      title = "Calendar | RoleNaviq";
    } else if (pathname === "/settings") {
      title = "Settings | RoleNaviq";
    } else if (pathname === "/login") {
      title = "Login | RoleNaviq";
    } else if (pathname === "/register") {
      title = "Register | RoleNaviq";
    }

    document.title = title;
  }, [pathname]);

  return null;
}
