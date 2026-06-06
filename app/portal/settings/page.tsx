import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-4">

      <h1 className="text-3xl font-bold">
        Settings
      </h1>

      <Link
        href="/portal/settings/users"
        className="
          block
          border
          rounded-lg
          p-4
          hover:bg-muted
        "
      >
        Users & Roles
      </Link>

    </div>
  );
}