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

/** Tuiles de décor, par type d'obstacle (chemins logiques, memes que les sprites). */
export const TILE_PATHS = {
    floor: "tiles/floor.png",
    wall: "tiles/wall.png",
    hole: "tiles/hole.png",
} as const
