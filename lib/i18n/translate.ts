export const translations = {
    en: {
      settings: "Settings",
      preferences: "Preferences",
      save: "Save Preferences",
      dashboard: "Dashboard",
      projects: "Projects",
      logout: "Logout",
      profilePreferences: "Profile Preferences",
      appearance: "Appearance / UI",
    },
  
    id: {
      settings: "Pengaturan",
      preferences: "Preferensi",
      save: "Simpan Preferensi",
      dashboard: "Dashboard",
      projects: "Proyek",
      logout: "Keluar",
      profilePreferences: "Preferensi Profil",
      appearance: "Tampilan / UI",
    },
  };
  
  export type Language = "en" | "id";
  
  export function t(
    lang: Language,
    key: keyof typeof translations.en
  ) {
    return translations[lang][key];
  }