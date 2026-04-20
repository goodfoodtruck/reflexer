import { Gambit } from "@gambits/gambits.types";
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types";
import { FightContext } from "@fight/context/FightContext";

export class EntityGambitActionResolver {
    resolve(gambits: Gambit[], fightContext: FightContext): ExecutionContext {
        // ConditionEvaluator
        // TargetEvaluator
        return "TODO" as unknown as ExecutionContext;
    }
}