import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Enterprise Settings
      </h1>

      <div className="grid md:grid-cols-2 gap-4">

        <Link className="p-4 border rounded hover:bg-gray-50" href="/portal/settings/company">
          🏢 Company Profile
        </Link>

        <Link className="p-4 border rounded hover:bg-gray-50" href="/portal/settings/users">
          👥 Users & Roles
        </Link>

        <Link className="p-4 border rounded hover:bg-gray-50" href="/portal/settings/notifications">
          🔔 Notifications Center
        </Link>

        <Link className="p-4 border rounded hover:bg-gray-50" href="/portal/settings/audit">
          📜 System Audit Logs
        </Link>

        <Link className="p-4 border rounded hover:bg-gray-50" href="/portal/settings/preferences">
          ⚙️ Preferences
        </Link>

      </div>
    </div>
  );
}