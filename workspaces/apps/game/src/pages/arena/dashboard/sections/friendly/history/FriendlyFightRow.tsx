import FightResultBadge from "@pages/arena/dashboard/fight-history/FightResultBadge"
import FightRowLayout from "@pages/arena/dashboard/fight-history/FightRowLayout"
import OpponentInfo from "@pages/arena/dashboard/fight-history/OpponentInfo"
import ReplayFightButton from "@pages/arena/dashboard/fight-history/ReplayFightButton"
import type { FriendlyFight } from "../../../../../../shared/types/fight.types"
import FightTurnsCounter from "@pages/arena/dashboard/fight-history/FightTurnsCounter"


interface FriendlyFightRowProps {
    fight: FriendlyFight
    userId: string
    opponentName: string
    index: number
    onReplay: () => void
}

const FriendlyFightRow: React.FC<FriendlyFightRowProps> = ({ fight, userId, opponentName, index, onReplay }) => {
    const won = fight.winnerId === userId

    return (
        <FightRowLayout index={index}>
            <OpponentInfo name={opponentName} date={new Date(fight.createdAt)} />

            <FightTurnsCounter fightNbTurns={fight.logs.length} />

            <div className="flex items-center gap-3">
                <FightResultBadge won={won} />
                <ReplayFightButton onClick={onReplay} />
            </div>
        </FightRowLayout>
    )
}

export default FriendlyFightRow