import { QueuedProcessor } from "@processors/processor.types";

export interface IReactiveContext {
    queueReaction(reaction: QueuedProcessor): void;
    drainReactions(): QueuedProcessor[];
}