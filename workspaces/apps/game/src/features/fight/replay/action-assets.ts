/**
 * Pont entre le chemin logique d'icône porté par la donnée moteur
 * (`Action.icon`, ex. "attaque/Boule-feu.png") et l'URL réelle de l'asset
 * bundlé par Vite. Même principe que `sprite-assets.ts` : `import.meta.glob`
 * embarque tout `assets/images/actions/**` au build et fournit la table de
 * correspondance chemin-de-module → URL.
 */
const ACTIONS_ROOT = "images/actions/"

const modules = import.meta.glob("../../../assets/images/actions/**/*.png", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>

const urlByLogicalPath = new Map<string, string>()
for (const [moduleKey, url] of Object.entries(modules)) {
    const at = moduleKey.indexOf(ACTIONS_ROOT)
    if (at === -1) continue
    urlByLogicalPath.set(moduleKey.slice(at + ACTIONS_ROOT.length), url)
}

/** Résout un chemin logique d'icône d'action vers l'URL bundlée, ou `null` si absent. */
export function resolveActionIconUrl(logicalPath: string): string | null {
    return urlByLogicalPath.get(logicalPath) ?? null
}
