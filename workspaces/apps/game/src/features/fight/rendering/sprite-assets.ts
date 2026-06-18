/**
 * Pont entre les chemins logiques portés par la donnée (SpriteClip.path, ex.
 * "skeleton2/attack.png") et les URLs réelles des assets bundlés par Vite.
 *
 * La donnée (moteur / future DB) ne connaît qu'un chemin logique ; c'est ici,
 * côté front, qu'on le résout vers l'asset hashé par le bundler. import.meta.glob
 * embarque tout `src/assets/sprites/**` au build et nous donne la table de
 * correspondance chemin-de-module → URL.
 */
const SPRITES_ROOT = "assets/sprites/"

const modules = import.meta.glob("../../../assets/sprites/**/*.png", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>

const urlByLogicalPath = new Map<string, string>()
for (const [moduleKey, url] of Object.entries(modules)) {
    const at = moduleKey.indexOf(SPRITES_ROOT)
    if (at === -1) continue
    urlByLogicalPath.set(moduleKey.slice(at + SPRITES_ROOT.length), url)
}

/** Résout un chemin logique d'asset vers l'URL bundlée, ou jette si absent. */
export function resolveSpriteUrl(logicalPath: string): string {
    const url = urlByLogicalPath.get(logicalPath)
    if (!url) {
        throw new Error(`Asset sprite introuvable pour le chemin logique « ${logicalPath} »`)
    }
    return url
}

/**
 * Fonds de carte plein-cadre (PNG ou GIF animé), bundlés depuis
 * `src/assets/maps/**`. Le chemin logique porté par `FightMapConfig.background`
 * est le nom de fichier relatif à ce dossier (ex. "lake.gif", "chemin.png").
 */
const MAPS_ROOT = "assets/maps/"

const mapModules = import.meta.glob("../../../assets/maps/**/*.{png,gif}", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>

const urlByMapBackground = new Map<string, string>()
for (const [moduleKey, url] of Object.entries(mapModules)) {
    const at = moduleKey.indexOf(MAPS_ROOT)
    if (at === -1) continue
    urlByMapBackground.set(moduleKey.slice(at + MAPS_ROOT.length), url)
}

/** Résout un chemin logique de fond de carte vers l'URL bundlée, ou jette si absent. */
export function resolveMapBackgroundUrl(logicalPath: string): string {
    const url = urlByMapBackground.get(logicalPath)
    if (!url) {
        throw new Error(`Asset de fond de carte introuvable pour le chemin logique « ${logicalPath} »`)
    }
    return url
}
