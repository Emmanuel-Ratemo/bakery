export interface CatalogSettings {
  themeSurchargeKes: number;
  occasionThemes: string[];
}

export const DEFAULT_CATALOG_SETTINGS: CatalogSettings = {
  themeSurchargeKes: 1500,
  occasionThemes: [
    'Elsa (Frozen)',
    'Sofia the First',
    'SpongeBob',
    'Cars (Disney)',
    'Custom theme',
  ],
};

export function normalizeCatalogSettings(
  input: Partial<CatalogSettings> | null | undefined
): CatalogSettings {
  const surcharge = Number(input?.themeSurchargeKes);
  const themes = Array.isArray(input?.occasionThemes)
    ? input.occasionThemes
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 40)
    : [];

  return {
    themeSurchargeKes:
      Number.isFinite(surcharge) && surcharge >= 0
        ? Math.round(surcharge)
        : DEFAULT_CATALOG_SETTINGS.themeSurchargeKes,
    occasionThemes:
      themes.length > 0
        ? [...new Set(themes)]
        : [...DEFAULT_CATALOG_SETTINGS.occasionThemes],
  };
}
