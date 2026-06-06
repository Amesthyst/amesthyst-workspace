"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  ChevronDown,
  Briefcase,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/logout";

import { useAuth } from "@/lib/context/AuthContext";

import {
  canManageHR,
  canManageCompany,
  canManageCRM,
  canManageProjects,
} from "@/lib/auth/permissions";

export default function Sidebar() {
  const pathname = usePathname();

  const { user } = useAuth();

  const [crmOpen, setCrmOpen] = useState(true);

  const isActive = (href: string) => {
    return (
      pathname === href ||
      pathname.startsWith(href + "/")
    );
  };

  return (
    <aside className="w-72 border-r bg-white flex flex-col">

      {/* LOGO */}
      <div className="h-16 border-b flex items-center px-6">
        <div>
          <h1 className="font-bold text-lg">
            Amesthyst Workspace
          </h1>

          <p className="text-xs text-muted-foreground">
            Enterprise Platform
          </p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-4 space-y-1">

        {/* DASHBOARD */}
        <Link
          href="/portal/dashboard"
          className={`
            flex items-center gap-3
            rounded-lg px-3 py-2
            text-sm transition-all
            ${
              isActive("/portal/dashboard")
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }
          `}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        {/* CRM */}
        {canManageCRM(user) && (
          <div>

            <button
              onClick={() => setCrmOpen(!crmOpen)}
              className="
                w-full
                flex
                items-center
                justify-between
                rounded-lg
                px-3
                py-2
                text-sm
                transition-all
                hover:bg-muted
              "
            >
              <div className="flex items-center gap-3">
                <Users size={18} />
                CRM
              </div>

              <ChevronDown
                size={16}
                className={`
                  transition-transform
                  ${crmOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {crmOpen && (
              <div className="ml-8 mt-1 space-y-1">

                <Link
                  href="/portal/crm"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      pathname === "/portal/crm"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Leads
                </Link>

                <Link
                  href="/portal/crm/pipeline"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      isActive("/portal/crm/pipeline")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Pipeline
                </Link>

                <Link
                  href="/portal/crm/activities"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      isActive("/portal/crm/activities")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Activities
                </Link>

                <Link
                  href="/portal/crm/analytics"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      isActive("/portal/crm/analytics")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Analytics
                </Link>

                <Link
                  href="/portal/crm/contacts"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      isActive("/portal/crm/contacts")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Contacts
                </Link>

              </div>
            )}
          </div>
        )}

        {/* HRIS */}
        {canManageHR(user) && (
          <Link
            href="/portal/hris"
            className={`
              flex items-center gap-3
              rounded-lg px-3 py-2
              text-sm transition-all
              ${
                isActive("/portal/hris")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }
            `}
          >
            <Building2 size={18} />
            HRIS
          </Link>
        )}

        {/* PROJECTS */}
        {canManageProjects(user) && (
          <Link
            href="/portal/projects"
            className={`
              flex items-center gap-3
              rounded-lg px-3 py-2
              text-sm transition-all
              ${
                isActive("/portal/projects")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }
            `}
          >
            <Briefcase size={18} />
            Projects
          </Link>
        )}

        {/* SETTINGS */}
        {canManageCompany(user) && (
          <Link
            href="/portal/settings"
            className={`
              flex items-center gap-3
              rounded-lg px-3 py-2
              text-sm transition-all
              ${
                isActive("/portal/settings")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }
            `}
          >
            <Settings size={18} />
            Settings
          </Link>
        )}

      </nav>

      {/* FOOTER */}
      <div className="border-t p-4 space-y-3">

        <div>
          <p className="font-medium text-sm">
            {user?.name || "User"}
          </p>

          <p className="text-xs text-muted-foreground">
            {user?.role?.name || "No Role"}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>

      </div>

    </aside>
  );
}