import { FightContext } from "@fight/context/FightContext"
import { PlayingEntity } from "@fight/fight.types"
import { FilterEvaluator, FilterType } from "@fight/gambits/entityFilters.types"
import { evaluateHpBelow } from "./evaluators/HpBelowEvaluator"
import { evaluateHpAbove } from "./evaluators/HpAboveEvaluator"
import { evaluateHasStatus } from "./evaluators/HasStatusEvaluator"

class EntityFilterEvaluatorRegistry {

    private evaluators = new Map<FilterType, FilterEvaluator<FilterType>>()

    /**
     * Permet d'enregistrer un FilterEvaluator pour un FilterType
     * @param type le type de critère
     * @param evaluator la fonction qui permet de valider si une entité respecte ce critère
     */
    register(type: FilterType, evaluator: FilterEvaluator<any>): void {
        this.evaluators.set(type, evaluator)
    }

    /**
     * Evalue si l'entité valide le critère passé en paramètre.
     * 
     * Jette une erreur si aucune fonction de type FilterEvaluator<T> n'a été enregistré
     * pour ce type de critère.
     * @param entity L'entité concernée
     * @param filterType Le type de critère
     * @param context Le contexte, dont les données seront utilisées pour vérifier ce critère
     * @returns true si l'entité valide le critère, false sinon
     */
    evaluate(
        entity: PlayingEntity, 
        filterType: FilterType, 
        context: Readonly<FightContext>
    ): boolean {
        const evaluator = this.evaluators.get(filterType)
        if (! evaluator) 
            throw new Error(`Filtre ${filterType} non enregistré`)
        return evaluator(entity, filterType, context)
    }

    /**
     * Permet de calculer, pour une liste d'entités, celles qui matchent
     * avec les critères passés en paramètres
     * @param entities 
     * @param filters 
     * @param context 
     * @returns
     */
    applyAll(
        entities: PlayingEntity[], 
        filters: FilterType[], 
        context: Readonly<FightContext>
    ): PlayingEntity[] {
        return entities.filter(entity =>
            filters.every(filter => this.evaluate(entity, filter, context))
        )
    }
}

export const buildFilterRegistry = (): EntityFilterEvaluatorRegistry => {
    const registry = new EntityFilterEvaluatorRegistry()

    registry.register("HP_BELOW",   evaluateHpBelow)
    registry.register("HP_ABOVE",   evaluateHpAbove)
    registry.register("HAS_STATUS", evaluateHasStatus)

    return registry
}