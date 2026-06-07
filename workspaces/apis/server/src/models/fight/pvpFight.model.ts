import { PlayingTeamID, FightEndState, EntityStats, Gambit, FightMapID } from "@reflexer/engine"
import { Types, Schema, model } from "mongoose"

type TeamMemberSnapshot = {
    characterName: string
    baseStats: EntityStats
    gambits: Gambit[]
}

const TeamMemberSnapshotSchema = new Schema({
    characterName:      { type: String, required: true },
    baseStats: { type: Schema.Types.Mixed, required: true },
    gambits:   { type: [Schema.Types.Mixed], required: true }
}, { _id: false })

export interface PvpFightDocument extends Document {
    mode: "RANKED" | "FRIENDLY"
    playerUserId:   Types.ObjectId
    opponentUserId: Types.ObjectId
    playerTeam:     TeamMemberSnapshot[]
    opponentTeam:   TeamMemberSnapshot[]
    winner:         PlayingTeamID
    endState:       FightEndState
    fightMapId:     FightMapID
    createdAt:      Date
    updatedAt:      Date
}

const PvpFightSchema = new Schema<PvpFightDocument>(
    {
        mode:           { type: String, required: true, enum: ["RANKED", "FRIENDLY"] },
        playerUserId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
        opponentUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        playerTeam:     { type: [TeamMemberSnapshotSchema], required: true },
        opponentTeam:   { type: [TeamMemberSnapshotSchema], required: true },
        winner:         { type: String, required: true, enum: ["PLAYER", "ENEMY"] },
        endState:       { type: Schema.Types.Mixed, required: true },
        fightMapId:     { type: String, required: true }
    },
    { timestamps: true }
)

export const PvpFightModel = model<PvpFightDocument>("PvpFight", PvpFightSchema)