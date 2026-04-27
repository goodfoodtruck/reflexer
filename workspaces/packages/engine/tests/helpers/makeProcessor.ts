import { vi } from 'vitest'
import { IProcessor } from '@fight/processors/IProcessor'
import { ActionLog } from '@fight/fight.types'
import { FightContext } from '@fight/context/FightContext'
import { ExecutionContext } from "@fight/turn-resolvers/execution-context.types"
import { ProcessorResult } from "@fight/processors/processor.types"

interface MakeProcessorOptions {
    status?: 'ok' | 'aborted'
    reason?: string
    logs?: ActionLog[]
    sideEffect?: (ctx: ExecutionContext, fightContext: FightContext) => void
}

export function makeProcessor(opts: MakeProcessorOptions = {}): IProcessor {
    return {
        execute: vi.fn((ctx: ExecutionContext, fightContext: FightContext): ProcessorResult => {
            opts.sideEffect?.(ctx, fightContext)
            if (opts.status === 'aborted') {
                return {
                    status: 'aborted',
                    reason: opts.reason ?? 'test_abort',
                    logs: opts.logs ?? [],
                }
            }
            return { status: 'ok', logs: opts.logs ?? [] }
        }),
    }
}