import { PlayingEntity } from "@fight/fight.types"
import { AnyFilter, FilterEvaluator, FilterType } from "@fight/gambits/resolvers/filters/entityFilters.types"
import { evaluateHpBelow } from "@fight/gambits/resolvers/filters/evaluators/HpBelowEvaluator"
import { evaluateHpAbove } from "@fight/gambits/resolvers/filters/evaluators/HpAboveEvaluator"
import { evaluateHasStatus } from "@fight/gambits/resolvers/filters/evaluators/HasStatusEvaluator"
import { IFightContextReader } from "@fight/context/IFightContextReader"

export class FilterEvaluatorRegistry {

    private evaluators = new Map<FilterType, FilterEvaluator<AnyFilter>>()

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
        filter: AnyFilter, 
        context: IFightContextReader
    ): boolean {
        const evaluator = this.evaluators.get(filter.type)
        if (! evaluator) 
            throw new Error(`Filtre ${filter.type} non enregistré`)
        return evaluator(entity, filter, context)
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
        filters: AnyFilter[], 
        context: IFightContextReader
    ): PlayingEntity[] {
        return entities.filter(entity =>
            filters.every(filter => this.evaluate(entity, filter, context))
        )
    }
}

export const buildFilterRegistry = (): FilterEvaluatorRegistry => {
    const registry = new FilterEvaluatorRegistry()

    registry.register("HP_BELOW",   evaluateHpBelow)
    registry.register("HP_ABOVE",   evaluateHpAbove)
    registry.register("HAS_STATUS", evaluateHasStatus)

    return registry
}