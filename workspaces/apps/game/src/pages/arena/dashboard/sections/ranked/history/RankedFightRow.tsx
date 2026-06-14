import FightResultBadge from "@pages/arena/dashboard/fight-history/FightResultBadge"
import FightRowLayout from "@pages/arena/dashboard/fight-history/FightRowLayout"
import OpponentInfo from "@pages/arena/dashboard/fight-history/OpponentInfo"
import ReplayFightButton from "@pages/arena/dashboard/fight-history/ReplayFightButton"
import type { RankedFight } from "@shared/types/fight.types"
import EloBadge from "./EloBadge"

interface RankedFightRowProps {
    fight: RankedFight
    playerId: string
    opponentName: string
    index: number
    onReplay: () => void
}

const RankedFightRow: React.FC<RankedFightRowProps> = ({ fight, playerId, opponentName, index, onReplay }) => {
    const won = fight.winnerId === playerId
    const isPlayer = fight.playerUserId === playerId
    const eloDelta = fight.ranking
        ? (isPlayer ? fight.ranking.eloDeltaUser : fight.ranking.eloDeltaOpponent)
        : null

    return (
        <FightRowLayout index={index}>
            <OpponentInfo name={opponentName} date={new Date(fight.createdAt)} />

            <div className="flex items-center gap-3">
                {eloDelta !== null && <EloBadge delta={eloDelta} />}
                <FightResultBadge won={won} />
                <ReplayFightButton onClick={onReplay} />
            </div>
        </FightRowLayout>
    )
}

export default RankedFightRow