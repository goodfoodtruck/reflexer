type Tab = "FRIENDLY" | "RANKED"

interface TabSelectorProps {
    activeTab: Tab
    onTabChange: (tab: Tab) => void
}

const TABS: { key: Tab; label: string }[] = [
    { key: "FRIENDLY", label: "Amical" },
    { key: "RANKED", label: "Classé" }
]

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => (
    <div className="flex gap-1 bg-slate-800/60 rounded-lg p-1">
        {TABS.map(tab => (
            <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex-1 py-2 px-4 rounded-md text-[10px] font-black tracking-widest uppercase transition-all ${
                    activeTab === tab.key
                        ? "bg-amber-600 text-white"
                        : "text-slate-400 hover:text-white"
                }`}
            >
                {tab.label}
            </button>
        ))}
    </div>
)

export default TabSelector