import { ITeamBuilder, PlayingEntity, PlayingTeamID } from "@fight/fight.types";
import { TeamMemberData } from "@game-engine/game-engine.types";
import { Position } from "@helpers/types/helpers.types";

export class TeamBuilder implements ITeamBuilder {

    buildTeam(
        members: TeamMemberData[],
        spawnPositions: Position[],
        teamId: PlayingTeamID
    ): PlayingEntity[] {
        return members.map((member, index) => ({
            id: `${teamId.toLowerCase()}_${index}`,
            teamId,
            tags: [],
            position: spawnPositions[index]!,
            baseStats: { ...member.baseStats },
            currentStats: { ...member.baseStats },
            gambits: [...member.gambits],
            activePassives: [],
            isDead: false
        }))
    }
}