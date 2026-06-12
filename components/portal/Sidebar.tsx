"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n/translate";
import { useLanguage } from "@/lib/i18n/useLanguage";

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

  const [hrisOpen,setHrisOpen] = useState(true);
  
  const { language } = useLanguage();

  const isActive = (href: string) => {
    return (
      pathname === href ||
      pathname.startsWith(href + "/")
    );
  };

  return (
    <aside className="w-72 border-r bg-sidebar text-sidebar-foreground flex flex-col">

      {/* LOGO */}
      <div className=" h-16 border-b border-sidebar-border flex items-center px-6">
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
          {t(language, "dashboard")}
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

        {canManageHR(user) && (
          <div>
            <button
              onClick={() => setHrisOpen(!hrisOpen)}
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
                <Building2 size={18} />
                HRIS
              </div>

              <ChevronDown
                size={16}
                className={`
                  transition-transform
                  ${hrisOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {hrisOpen && (
              <div className="ml-8 mt-1 space-y-1">

                <Link
                  href="/portal/hris"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      pathname === "/portal/hris"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Dashboard
                </Link>

                <Link
                  href="/portal/hris/employees"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      pathname.startsWith("/portal/hris/employees")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Employee Directory
                </Link>

                <Link
                  href="/portal/hris/departments"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      pathname.startsWith("/portal/hris/departments")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Departments
                </Link>

                <Link
                  href="/portal/hris/attendance"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      pathname.startsWith("/portal/hris/attendance")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Attendance
                </Link>

                <Link
                  href="/portal/hris/leave"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      pathname.startsWith("/portal/hris/leave")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  Leave Requests
                </Link>


                <Link
                  href="/portal/hris/payroll"
                  className={`
                    block rounded-lg px-3 py-2 text-sm
                    ${
                      pathname.startsWith("/portal/hris/payroll")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }
                  `}
                >
                  PayRoll
                </Link>
              </div>
            )}
          </div>
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
            {t(language, "projects")}
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
            {t(language, "settings")}
          </Link>
        )}

      </nav>

      {/* FOOTER */}
      <div className="border-t border-sidebar-border p-4 space-y-3">

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
          {t(language, "logout")}
        </Button>

      </div>

    </aside>
  );
}