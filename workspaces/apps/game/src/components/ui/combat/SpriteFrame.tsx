import type { SpriteIcon } from "../../../features/fight/replay/combat-view.types"

/**
 * Affiche la première frame d'une spritesheet horizontale comme portrait statique.
 * La largeur de l'image est étirée à `frames × 100%` du conteneur ; le conteneur
 * adopte le ratio d'une frame, donc la frame 0 (calée à gauche) le remplit
 * exactement, le reste de la bande étant masqué par `overflow-hidden`.
 * Hauteur pilotée par le parent (ex. `className="h-8"`).
 */
export function SpriteFrame({ icon, className }: { icon: SpriteIcon; className?: string }) {
    return (
        <div
            className={`relative overflow-hidden shrink-0 ${className ?? ""}`}
            style={{ aspectRatio: `${icon.frameWidth} / ${icon.frameHeight}` }}
        >
            <img
                src={icon.url}
                alt=""
                draggable={false}
                className="absolute left-0 top-0 h-full max-w-none"
                style={{ width: `${icon.frames * 100}%`, imageRendering: "pixelated" }}
            />
        </div>
    )
}
