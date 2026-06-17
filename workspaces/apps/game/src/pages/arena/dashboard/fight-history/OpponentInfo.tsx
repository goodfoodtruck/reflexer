import { formatTimeAgo } from "@shared/helpers/formatTimeAgo"

interface OpponentInfoProps {
    name: string
    date: Date
}

const OpponentInfo: React.FC<OpponentInfoProps> = ({ name, date }) => (
    <div className="flex flex-col">
        <span className="text-sm font-black tracking-widest uppercase text-white">
            {name}
        </span>
        <span className="text-[10px] text-slate-500 font-bold">
            {formatTimeAgo(date)}
        </span>
    </div>
)

export default OpponentInfo