"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useTheme } from "@/lib/theme/useTheme";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { t } from "@/lib/i18n/translate";

type Preference = {
  displayName?: string;
  avatarUrl?: string;
  jobTitle?: string;
  bio?: string;

  theme: "light" | "dark";
  density: "compact" | "comfortable";
  language: "en" | "id";
  timeFormat: "12h" | "24h";
};

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { language, changeLanguage } =
    useLanguage();

  const [form, setForm] =
    useState<Preference>({
      displayName: "",
      avatarUrl: "",
      jobTitle: "",
      bio: "",

      theme: "light",
      density: "comfortable",
      language: "en",
      timeFormat: "24h",
    });

  useTheme(form.theme);

  async function load() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/preferences"
      );

      const data = await res.json();

      if (data) {
        setForm({
          displayName:
            data.displayName ?? "",
          avatarUrl:
            data.avatarUrl ?? "",
          jobTitle:
            data.jobTitle ?? "",
          bio:
            data.bio ?? "",

          theme:
            data.theme ?? "light",

          density:
            data.density ??
            "comfortable",

          language:
            data.language ?? "en",

          timeFormat:
            data.timeFormat ?? "24h",
        });

        changeLanguage(
          data.language ?? "en"
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      setSaving(true);

      await fetch(
        "/api/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      localStorage.setItem(
        "language",
        form.language
      );

      alert(
        language === "id"
          ? "Preferensi berhasil disimpan"
          : "Preferences saved successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        language === "id"
          ? "Gagal menyimpan preferensi"
          : "Failed to save preferences"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading preferences...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          {t(
            language,
            "preferences"
          )}
        </h1>

        <p className="text-muted-foreground">
          Manage your personal
          preferences.
        </p>
      </div>

      {/* PROFILE */}

      <Card className="p-6 space-y-4">

        <h2 className="font-semibold text-lg">
          👤{" "}
          {t(
            language,
            "profilePreferences"
          )}
        </h2>

        <Input
          placeholder="Display Name"
          value={
            form.displayName || ""
          }
          onChange={(e) =>
            setForm({
              ...form,
              displayName:
                e.target.value,
            })
          }
        />

        <Input
          placeholder="Avatar URL"
          value={
            form.avatarUrl || ""
          }
          onChange={(e) =>
            setForm({
              ...form,
              avatarUrl:
                e.target.value,
            })
          }
        />

        <Input
          placeholder="Job Title"
          value={
            form.jobTitle || ""
          }
          onChange={(e) =>
            setForm({
              ...form,
              jobTitle:
                e.target.value,
            })
          }
        />

        <Input
          placeholder="Bio"
          value={form.bio || ""}
          onChange={(e) =>
            setForm({
              ...form,
              bio: e.target.value,
            })
          }
        />

      </Card>

      {/* APPEARANCE */}

      <Card className="p-6 space-y-4">

        <h2 className="font-semibold text-lg">
          🌙{" "}
          {t(
            language,
            "appearance"
          )}
        </h2>

        {/* THEME */}

        <div>
          <label className="block mb-2 text-sm font-medium">
            Theme
          </label>

          <select
            className="
              w-full
              rounded-md
              border
              bg-background
              px-3
              py-2
            "
            value={form.theme}
            onChange={(e) =>
              setForm({
                ...form,
                theme:
                  e.target
                    .value as
                    "light" | "dark",
              })
            }
          >
            <option value="light">
              Light
            </option>

            <option value="dark">
              Dark
            </option>
          </select>
        </div>

        {/* DENSITY */}

        <div>
          <label className="block mb-2 text-sm font-medium">
            Density
          </label>

          <select
            className="
              w-full
              rounded-md
              border
              bg-background
              px-3
              py-2
            "
            value={form.density}
            onChange={(e) =>
              setForm({
                ...form,
                density:
                  e.target
                    .value as
                    | "compact"
                    | "comfortable",
              })
            }
          >
            <option value="comfortable">
              Comfortable
            </option>

            <option value="compact">
              Compact
            </option>
          </select>
        </div>

        {/* LANGUAGE */}

        <div>
          <label className="block mb-2 text-sm font-medium">
            Language
          </label>

          <select
            className="
              w-full
              rounded-md
              border
              bg-background
              px-3
              py-2
            "
            value={form.language}
            onChange={(e) => {
              const lang =
                e.target
                  .value as
                "en" | "id";

              changeLanguage(lang);

              setForm({
                ...form,
                language: lang,
              });
            }}
          >
            <option value="en">
              English
            </option>

            <option value="id">
              Indonesia
            </option>
          </select>
        </div>

        {/* TIME FORMAT */}

        <div>
          <label className="block mb-2 text-sm font-medium">
            Time Format
          </label>

          <select
            className="
              w-full
              rounded-md
              border
              bg-background
              px-3
              py-2
            "
            value={form.timeFormat}
            onChange={(e) =>
              setForm({
                ...form,
                timeFormat:
                  e.target
                    .value as
                    "12h" | "24h",
              })
            }
          >
            <option value="24h">
              24 Hour
            </option>

            <option value="12h">
              12 Hour
            </option>
          </select>
        </div>

      </Card>

      <Button
        onClick={save}
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : t(language, "save")}
      </Button>

    </div>
  );
}