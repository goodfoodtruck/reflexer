interface FightTurnsCounterProps {
    fightNbTurns: number
}

const FightTurnsCounter: React.FC<FightTurnsCounterProps> = ({ fightNbTurns }) => {
    return (
        <div className="">{fightNbTurns} tours</div>
    )
}

export default FightTurnsCounter