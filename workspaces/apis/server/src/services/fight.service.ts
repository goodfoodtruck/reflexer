import type { FightError, FightMapID, FightResult, PlayingTeamID, Result } from "@reflexer/engine"
import { FIGHT_MAPS, pickRandomFightMapId, createGameEngine } from "@reflexer/engine"
import type { FightMapConfig } from "@reflexer/engine"
import { PvpFightRepository } from "@repositories/fight/pvpFight.repository"
import { PveFightRepository } from "@repositories/fight/pveFight.repository"
import { UserRepository } from "@repositories/user.repository"
import { UserRankingRepository } from "@repositories/ranked/userRanking.repository"
import { FightRankingRepository } from "@repositories/ranked/fightRanking.repository"
import { NotificationRepository } from "@repositories/notification.repository"
import { TeamService } from "./team.service"
import { computeEloChange } from "./ranked.service"

type GameEngine = ReturnType<typeof createGameEngine>

export class FightService {
    constructor(
        private readonly engine: GameEngine,
        private readonly pvpFightRepo: PvpFightRepository,
        private readonly pveFightRepo: PveFightRepository,
        private readonly userRepo: UserRepository,
        private readonly userRankingRepo: UserRankingRepository,
        private readonly fightRankingRepo: FightRankingRepository,
        private readonly notificationRepo: NotificationRepository,
        private readonly teamService: TeamService
    ) {}

    getMaps() {
        return FIGHT_MAPS.map((map: Partial<FightMapConfig>) => ({
            id: map.id,
            name: map.name,
            thumbnail: map.thumbnail ?? map.background ?? null
        }))
    }

    async getFightById(fightId: string) {
        const fight = await this.pvpFightRepo.findById(fightId)
        if (!fight) throw Object.assign(new Error("FIGHT_NOT_FOUND"), { status: 404 })
        return fight
    }

    async getFriendlyHistory(userId: string) {
        return this.pvpFightRepo.findFriendlyByUser(userId)
    }

    async getRankedHistory(userId: string) {
        return this.pvpFightRepo.findRankedByUser(userId)
    }

    async getTrainingHistory(userId: string) {
        return this.pveFightRepo.findByUserId(userId)
    }

    async playFriendly(playerId: string, opponentId: string, fightMapId: FightMapID) {
        const [playerUser, opponentUser] = await Promise.all([
            this.userRepo.findById(playerId),
            this.userRepo.findById(opponentId)
        ])
        if (!playerUser || !opponentUser) throw Object.assign(new Error("USER_NOT_FOUND"), { status: 404 })

        const playerTeam   = await this.teamService.buildTeamFromUserId(playerId)
        const opponentTeam = await this.teamService.buildTeamFromUserId(opponentId)
        if (!playerTeam.length || !opponentTeam.length) throw Object.assign(new Error("TEAM_EMPTY"), { status: 400 })

        const result: Result<FightResult, FightError> = this.engine.playPvpFight(fightMapId, playerTeam, opponentTeam)
        if (!result.success) throw Object.assign(new Error(result.reason), { status: 400 })

        const winnerId: string = result.value.endState.kind === "WON" ? playerId : opponentId
        const winnerTeamID: PlayingTeamID = result.value.endState.kind === "WON" ? "PLAYER" : "ENEMY"

        const fight = await this.pvpFightRepo.create({
            mode: "FRIENDLY",
            playerUserId: playerId,
            opponentUserId: opponentId,
            playerTeam: playerTeam.map(m => ({
                characterName: m.characterName,
                baseStats: m.baseStats,
                gambits: m.gambits
            })),
            opponentTeam: opponentTeam.map(m => ({
                characterName: m.characterName,
                baseStats: m.baseStats,
                gambits: m.gambits
            })),
            winnerId,
            endState: result.value.endState,
            initialState: result.value.initialState,
            logs: result.value.logs
        })

        await this.notificationRepo.create({
            userId: opponentId,
            fromName: playerUser.name,
            fightId: fight._id,
            winner: winnerTeamID
        })

        return { ...fight.toObject(), playerUser, opponentUser }
    }

    async playRanked(userId: string) {
        const user = await this.userRepo.findById(userId)
        if (!user) throw Object.assign(new Error("USER_NOT_FOUND"), { status: 404 })

        const userRanking = await this.userRankingRepo.findByUserId(userId)
        if (!userRanking) throw Object.assign(new Error("USER_RANKING_NOT_FOUND"), { status: 404 })

        const opponentRanking = await this.userRankingRepo.findClosestEloOpponent(userId, userRanking.currentElo)
        if (!opponentRanking) throw Object.assign(new Error("NO_OPPONENT_FOUND"), { status: 404 })

        const opponentId = opponentRanking.userId.toString()
        const opponentUser = await this.userRepo.findById(opponentId)
        if (!opponentUser) throw Object.assign(new Error("USER_NOT_FOUND"), { status: 404 })

        const fightMapId = pickRandomFightMapId()
        const userTeam     = await this.teamService.buildTeamFromUserId(userId)
        const opponentTeam = await this.teamService.buildTeamFromUserId(opponentId)
        if (!userTeam.length || !opponentTeam.length) throw Object.assign(new Error("TEAM_EMPTY"), { status: 400 })

        const result: Result<FightResult, FightError> = this.engine.playPvpFight(fightMapId, userTeam, opponentTeam)
        if (!result.success) throw Object.assign(new Error(result.reason), { status: 400 })

        const winnerId: string = result.value.endState.kind === "WON" ? userId : opponentId
        const winnerTeamID: PlayingTeamID = result.value.endState.kind === "WON" ? "PLAYER" : "ENEMY"
        const userWon = winnerId === userId

        const fight = await this.pvpFightRepo.create({
            mode: "RANKED",
            playerUserId: userId,
            opponentUserId: opponentId,
            playerTeam: userTeam.map(m => ({
                characterName: m.characterName,
                baseStats: m.baseStats,
                gambits: m.gambits
            })),
            opponentTeam: opponentTeam.map(m => ({
                characterName: m.characterName,
                baseStats: m.baseStats,
                gambits: m.gambits
            })),
            winnerId,
            endState: result.value.endState,
            initialState: result.value.initialState,
            logs: result.value.logs
        })

        const userDeltaElo       = computeEloChange(userRanking.currentElo, opponentRanking.currentElo, userWon ? 1 : 0)
        const userEloAfter        = Math.max(100, userRanking.currentElo + userDeltaElo)
        const userWinstreakAfter  = userWon ? userRanking.currentWinstreak + 1 : 0

        const opponentDeltaElo      = computeEloChange(opponentRanking.currentElo, userRanking.currentElo, userWon ? 0 : 1)
        const opponentEloAfter       = Math.max(100, opponentRanking.currentElo + opponentDeltaElo)
        const opponentWinstreakAfter = userWon ? 0 : opponentRanking.currentWinstreak + 1

        const fightRankingData = await this.fightRankingRepo.create({
            fightId: fight.id,
            userId,
            opponentId,
            winnerId,
            userEloBefore:     userRanking.currentElo,
            userEloAfter,
            opponentEloBefore: opponentRanking.currentElo,
            opponentEloAfter,
            eloDeltaUser:      userDeltaElo,
            eloDeltaOpponent:  opponentDeltaElo
        })

        await Promise.all([
            this.userRankingRepo.updateAfterFight(userId, {
                currentElo:       userEloAfter,
                highestElo:       Math.max(userRanking.highestElo, userEloAfter),
                currentWinstreak: userWinstreakAfter,
                highestWinstreak: Math.max(userRanking.highestWinstreak, userWinstreakAfter),
                won: userWon
            }),
            this.userRankingRepo.updateAfterFight(opponentId, {
                currentElo:       opponentEloAfter,
                highestElo:       Math.max(opponentRanking.highestElo, opponentEloAfter),
                currentWinstreak: opponentWinstreakAfter,
                highestWinstreak: Math.max(opponentRanking.highestWinstreak, opponentWinstreakAfter),
                won: !userWon
            })
        ])

        await this.notificationRepo.create({
            userId: opponentId,
            fromName: user.name,
            fightId: fight._id,
            winner: winnerTeamID
        })

        return {
            ...fight.toObject(),
            fightRankingData: fightRankingData.toObject(),
            player: {
                user: { id: user.id, name: user.name },
                ranking: {
                    eloBefore: userRanking.currentElo,
                    eloAfter:  userEloAfter,
                    eloDelta:  userDeltaElo,
                    won:       userWon
                }
            },
            opponent: {
                user: { id: opponentUser.id, name: opponentUser.name },
                ranking: {
                    eloBefore: opponentRanking.currentElo,
                    eloAfter:  opponentEloAfter,
                    eloDelta:  opponentDeltaElo,
                    won:       !userWon
                }
            }
        }
    }
}
