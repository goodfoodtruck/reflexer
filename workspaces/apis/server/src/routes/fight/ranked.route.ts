import { Router } from "express"
import type { FightError, FightResult, PlayingTeamID, Result, TeamMemberData } from "@reflexer/engine"
import { PvpFightModel } from "@models/fight/pvpFight.model"
import { UserModel } from "@models/user.model"
import { NotificationModel } from "@models/notification.model"
import { buildTeamFromUserId } from "@services/team.service"
import { engine } from "../.."
import { UserRankingDocument, UserRankingModel } from "@models/ranked/user_ranking.model"
import { computeEloChange } from "@services/ranked.service"
import { FightRankingModel } from "@models/ranked/fight_ranking.model"
import { Types } from "mongoose"
 
const router = Router()

router.post("/", async (req, res) => {
    try {
        const { userId } = req.body as { userId: string }
        const user = await UserModel.findById(userId, { name: 1 })
        if (! user) {
            res.status(404).json({ error: "USER_NOT_FOUND" })
            return
        }

        const userRanking = await UserRankingModel.findOne({ userId })
        if (! userRanking) {
            res.status(404).json({ error: 'USER_RANKING_NOT_FOUND' })
            return
        }

        const userObjectId = new Types.ObjectId(userId)
        
        const opponentsRanking: UserRankingDocument[] = await UserRankingModel.aggregate([
            {
                $match: {
                    userId: { $ne: userObjectId },
                    currentElo: {
                        $gte: userRanking.currentElo - 100,
                        $lte: userRanking.currentElo + 100
                    }
                }
            },
            {
                $addFields: {
                    eloDistance: {
                        $abs: {
                            $subtract: ["$currentElo", userRanking.currentElo]
                        }
                    }
                }
            },
            { $sort: { eloDistance: 1 } },
            { $limit: 1 }
        ])

        if (! opponentsRanking.length) {
            res.status(404).json({ error: "NO_OPPONENT_FOUND" })
            return
        }

        const opponentRanking = opponentsRanking[0]!

        const opponentId = opponentRanking.userId as unknown as string
        const opponentUser = await UserModel.findById(opponentId, { name: 1 })
        if (! opponentUser) {
            res.status(404).json({ error: "USER_NOT_FOUND" })
            return
        }

        // TODO: carte alétoire
        const fightMapId = "TRAINING_GROUND"
        const userTeam     = await buildTeamFromUserId(userId)                
        const opponentTeam = await buildTeamFromUserId(opponentId)        

        if (! userTeam.length || ! opponentTeam.length) {
            res.status(400).json({ error: "TEAM_EMPTY" })
            return
        }

        // calcul du combat et désignation du vainqueur
        const result: Result<FightResult, FightError> = engine.playPvpFight(fightMapId, userTeam, opponentTeam)

        if (! result.success) {
            res.status(400).json({ error: result.reason })
            return
        }

        const winnerId = result.value.endState.kind === "WON" ? userId : opponentId
        const winnerTeamID: PlayingTeamID = result.value.endState.kind === "WON" ? "PLAYER" : "ENEMY"

        const fight = await PvpFightModel.create({
            mode: "RANKED",
            playerUserId: userId,
            opponentUserId: opponentId,
            userTeam: userTeam.map((teamMember: TeamMemberData) => ({
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

        // calcul et mise à jour des données de ranking des joueurs        
       
        const userWon = winnerId === userId

        const userDeltaElo = computeEloChange(userRanking.currentElo, opponentRanking.currentElo, userWon ? 1 : 0)
        const userEloAfter = Math.max(100, (userRanking.currentElo + userDeltaElo))
        const userWinstreakAfter = userWon ? userRanking.currentWinstreak + 1 : 0

        const opponentDeltaElo = computeEloChange(opponentRanking.currentElo, userRanking.currentElo, userWon ? 0 : 1)
        const opponentEloAfter = Math.max(100, (opponentRanking.currentElo + opponentDeltaElo))
        const opponentWinstreakAfter = userWon ?  0 : opponentRanking.currentWinstreak + 1

        const fightRankingData = await FightRankingModel.create({
            fightId: fight.id,
            userId,
            opponentId,
            winnerId,
            userEloBefore: userRanking.currentElo,
            userEloAfter,
            opponentEloBefore: opponentRanking.currentElo,
            opponentEloAfter,
            eloDeltaUser: userDeltaElo,
            eloDeltaOpponent: opponentDeltaElo
        })


        // mettre à jour les données de ranking des deux joueurs
        await UserRankingModel.updateOne(
            { userId },
            {
                $set: {
                    currentElo: userEloAfter,
                    highestElo: Math.max(userRanking.highestElo, userEloAfter),
                    currentWinstreak: userWinstreakAfter,
                    highestWinstreak: Math.max(userRanking.highestWinstreak, userWinstreakAfter)
                },
                $inc: {
                    wins: userWon ? 1 : 0,
                    wosses: userWon ? 0 : 1,
                    totalGames: 1
                }
            }
        )

        await UserRankingModel.updateOne(
            { userId: opponentId },
            {
                $set: {
                    currentElo: opponentEloAfter,
                    highestElo: Math.max(opponentRanking.highestElo, opponentEloAfter),
                    currentWinstreak: opponentWinstreakAfter,
                    highestWinstreak: Math.max(opponentRanking.highestWinstreak, opponentWinstreakAfter)
                },
                $inc: {
                    wins: userWon ? 0 : 1,
                    losses: userWon ? 1 : 0,
                    totalGames: 1
                }
            }
        )

        // Notifier l'adversaire
        await NotificationModel.create({
            userId: opponentId,
            fromName: user.name,
            fightId: fight._id,
            winner: winnerTeamID
        });
        
        res.status(201).json({
            ...fight.toObject(),
            fightRankingData: fightRankingData.toObject(),
            player: {
                user: {
                    id: user.id,
                    name: user.name
                },
                ranking: {
                    eloBefore: userRanking.currentElo,
                    eloAfter: userEloAfter,
                    eloDelta: userDeltaElo,
                    won: userWon
                }
            },
            opponent: {
                user: {
                    id: opponentUser.id,
                    name: opponentUser.name
                },
                ranking: {
                    eloBefore: opponentRanking.currentElo,
                    eloAfter: opponentEloAfter,
                    eloDelta: opponentDeltaElo,
                    won: !userWon
                }
            }
        })

    } catch (error) {
        console.error("Error:", error)
        res.status(500).json({ error: "INTERNAL_ERROR" })
    }
})
 
export default router
