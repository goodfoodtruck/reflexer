import { useLayoutEffect, useRef, useState } from "react"

/**
 * Calcule le facteur d'échelle pour faire tenir une scène de taille logique
 * fixe (`width`×`height`, en px Pixi) dans l'espace disponible mesuré sur le
 * conteneur retourné, en préservant le ratio. La scène Pixi continue de rendre
 * à sa résolution logique ; c'est une transform CSS qui la met à l'échelle, ce
 * qui garde l'overlay HTML (barres de vie) aligné sans calcul supplémentaire.
 */
export function useStageFit(width: number, height: number) {
    const ref = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el || width <= 0 || height <= 0) return

        const measure = () => {
            const { width: availW, height: availH } = el.getBoundingClientRect()
            if (availW === 0 || availH === 0) return
            setScale(Math.min(availW / width, availH / height))
        }

        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => observer.disconnect()
    }, [width, height])

    return { fitRef: ref, scale }
}
