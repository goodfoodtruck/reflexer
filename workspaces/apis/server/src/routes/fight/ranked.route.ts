import { Router } from "express"
import type { FightError, FightResult, PlayingTeamID, Result, TeamMemberData } from "@reflexer/engine"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { UserModel } from "@models/user.model"
import { NotificationModel } from "@models/notification.model"
import { buildTeamFromUserId } from "@services/team.service"
import { engine } from "../.."
import { PlayerRankingModel } from "@models/ranked/player_ranking.model"
import { computeEloChange } from "@services/ranked.service"
import { FightRankingModel } from "@models/ranked/fight_ranking.model"
 
const router = Router()

router.post("/", async (req, res) => {
    try {
        const { playerId } = req.body as { playerId: string }
        const playerUser = await UserModel.findById(playerId, { name: 1 })
        if (! playerUser) {
            res.status(404).json({ error: "USER_NOT_FOUND" })
            return
        }

        // TODO: trouver adversaire avec elo similaire
        const opponentId = "000000000000000000000001"
        const opponentUser = await UserModel.findById(opponentId, { name: 1 })
        if (! opponentUser) {
            res.status(404).json({ error: "USER_NOT_FOUND" })
            return
        }

        // TODO: carte alétoire
        const fightMapId = "TRAINING_GROUND"

        const playerTeam   = await buildTeamFromUserId(playerId)
        const opponentTeam = await buildTeamFromUserId(opponentId)

        if (! playerTeam.length || ! opponentTeam.length) {
            res.status(400).json({ error: "TEAM_EMPTY" })
            return
        }

        const result: Result<FightResult, FightError> = engine.playPvpFight(fightMapId, playerTeam, opponentTeam)

        if (! result.success) {
            res.status(400).json({ error: result.reason })
            return
        }

        const winnerId = result.value.endState.kind === "WON" ? playerId : opponentId
        const winnerTeamID: PlayingTeamID = result.value.endState.kind === "WON" ? "PLAYER" : "ENEMY"

        const fight = await PvpFightModel.create({
            mode: "RANKED",
            playerUserId: playerId,
            opponentUserId: opponentId,
            playerTeam: playerTeam.map((teamMember: TeamMemberData) => ({
                characterName: teamMember.characterName,
                baseStats: teamMember.baseStats,
                gambits: teamMember.gambits
            })),
            opponentTeam: opponentTeam.map((teamMember: TeamMemberData) => ({
                characterName: teamMember.characterName,
                baseStats: teamMember.baseStats,
                gambits: teamMember.gambits
            })),
            winnerId,
            endState: result.value.endState,
            initialState: result.value.initialState,
            logs: result.value.logs
        })

        const playerRanking = await PlayerRankingModel.findOne({ playerId })
        const opponentRanking = await PlayerRankingModel.findOne({ playerId: opponentId })

        if (! playerRanking || ! opponentRanking) {
            res.status(400).json({ error: "Player ranking not found." })
            return
        }

        const playerWon = winnerId === playerId
        const playerDeltaElo = computeEloChange(playerRanking.elo, opponentRanking.elo, playerWon ? 1 : 0)
        const opponentDeltaElo = computeEloChange(opponentRanking.elo, playerRanking.elo, playerWon ? 0 : 1)
        const playerEloAfter = playerRanking.elo + playerDeltaElo
        const opponentEloAfter = opponentRanking.elo + opponentDeltaElo

        await FightRankingModel.create({
            fightId: fight.id,
            playerId,
            opponentId,
            winnerId,
            playerEloBefore: playerRanking.elo,
            playerEloAfter,
            opponentEloBefore: opponentRanking.elo,
            opponentEloAfter,
            eloDeltaPlayer: playerDeltaElo,
            eloDeltaOpponent: opponentDeltaElo
        })


        // mettre à jour les données de ranking des deux joueurs
        await PlayerRankingModel.updateOne(
            { playerId },
            {
                $set: {
                    elo: playerEloAfter,
                    highestElo: Math.max(playerRanking.highestElo, playerEloAfter)
                },
                $inc: {
                    rankedWins: playerWon ? 1 : 0,
                    rankedLosses: playerWon ? 0 : 1,
                    totalGames: 1
                }
            }
        )

        await PlayerRankingModel.updateOne(
            { playerId: opponentId },
            {
                $set: {
                    elo: opponentEloAfter,
                    highestElo: Math.max(opponentRanking.highestElo, opponentEloAfter)
                },
                $inc: {
                    rankedWins: playerWon ? 0 : 1,
                    rankedLosses: playerWon ? 1 : 0,
                    totalGames: 1
                }
            }
        )

        // Notifier l'adversaire
        await NotificationModel.create({
            userId: opponentId,
            fromName: playerUser.name,
            fightId: fight._id,
            winner: winnerTeamID
        });
        
        res.status(201).json({
            ...fight.toObject(),
            player: {
                user: playerUser,
                ranking: {
                    eloBefore: playerRanking.elo,
                    eloAfter: playerEloAfter,
                    eloDelta: playerDeltaElo,
                    won: playerWon
                }
            },
            opponent: {
                user: opponentUser,
                ranking: {
                    eloBefore: opponentRanking.elo,
                    eloAfter: opponentEloAfter,
                    eloDelta: opponentDeltaElo,
                    won: !playerWon
                }
            }
        })

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})
 
export default router
