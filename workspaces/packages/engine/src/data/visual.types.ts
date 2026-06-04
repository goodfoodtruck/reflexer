/**
 * Description visuelle d'un personnage, portée par la donnée (mock aujourd'hui,
 * future table en base). C'est le contrat que le moteur transmet au front pour
 * qu'il sache, pour chaque état d'animation : QUEL fichier charger (`path`,
 * chemin logique résolu côté front) et COMMENT le jouer (nombre de frames,
 * taille d'une frame, durée totale, bouclage).
 *
 * Le moteur n'a aucune connaissance du bundler : `path` est un chemin logique
 * (ex. "skeleton2/attack.png") que le front mappe vers l'asset réel.
 */
export type SpriteClip = {
    /** Chemin logique de la spritesheet (bande horizontale de frames). */
    path: string
    /** Nombre de frames dans la bande. */
    frames: number
    /** Largeur d'une frame, en pixels source. */
    frameWidth: number
    /** Hauteur d'une frame, en pixels source. */
    frameHeight: number
    /** Durée totale de l'animation, en millisecondes. */
    durationMs: number
    /** `true` pour une animation en boucle (idle, déplacement). */
    loop: boolean
}

/**
 * Jeu d'animations d'une entité. Seul `idle` est requis (état au repos / spawn) ;
 * les autres clips sont optionnels — quand un clip manque, le front retombe sur
 * un effet générique (secousse, flash, fondu).
 */
export type EntityVisual = {
    /**
     * Hauteur, en pixels source, du corps de la créature au repos. Sert à
     * normaliser la taille d'affichage entre des sprites d'échelles différentes
     * (un prêtre 16px et un squelette 32px ont un corps de ~15px → même taille à
     * l'écran). Permet aussi de grossir volontairement un boss.
     */
    referenceHeight: number
    idle: SpriteClip
    move?: SpriteClip
    attack?: SpriteClip
    hurt?: SpriteClip
    death?: SpriteClip
}
