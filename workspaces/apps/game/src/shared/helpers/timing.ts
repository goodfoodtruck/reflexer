export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Exécute `task` en garantissant qu'au moins `minDurationMs` se soient écoulées
 * avant de propager le résultat — succès OU échec. Tâche et délai tournent en
 * parallèle : aucune attente artificielle n'est ajoutée si la tâche est déjà
 * plus lente que la durée minimale.
 *
 * L'échec respecte aussi la durée minimale (pas de flash de l'overlay). Pour
 * couper court dès l'erreur, remplacer le corps par `Promise.all([task, delay(...)])`.
 */
export async function withMinimumDuration<T>(task: Promise<T>, minDurationMs: number): Promise<T> {
    const [outcome] = await Promise.all([
        task.then(
            value => ({ ok: true as const, value }),
            error => ({ ok: false as const, error }),
        ),
        delay(minDurationMs),
    ])

    if (outcome.ok) return outcome.value
    throw outcome.error
}