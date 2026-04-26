import {PlayingEntity} from "@fight/fight.types";
import {buildPlayingEntity} from "@tests/builders/PlayingEntityBuilder";
import {FightContext} from "@fight/context/FightContext";
import {buildFightMap} from "@tests/builders/FightMapBuilder";

export function buildFightContext(playerOverrides: Partial<PlayingEntity>[] = [{}], enemyOverrides: Partial<PlayingEntity>[] = [{}]): FightContext {
    const players = playerOverrides.map((playerEntity, i) =>
        buildPlayingEntity({ id: `player_${i}`, teamId: 'PLAYER', ...playerEntity })
    )
    const enemies = enemyOverrides.map((enemyEntity, i) =>
        buildPlayingEntity({ id: `enemy_${i}`, teamId: 'ENEMY', ...enemyEntity })
    )
    return new FightContext([...players, ...enemies], buildFightMap())
}