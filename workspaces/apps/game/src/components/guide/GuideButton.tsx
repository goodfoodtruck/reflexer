// bouton "?" en bas a droite

type Props = {
    onClick: () => void
}

export function GuideButton({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            title="Relancer le guide"
            style={{
                position:     "fixed",
                bottom:       "24px",
                right:        "24px",
                zIndex:       9000,
                width:        "44px",
                height:       "44px",
                borderRadius: "50%",
                background:   "#12192b",
                border:       "1px solid rgba(245,158,11,0.4)",
                color:        "#f59e0b",
                fontSize:     "18px",
                cursor:       "pointer",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                boxShadow:    "0 4px 12px rgba(0,0,0,0.4)",
                transition:   "all 0.2s ease",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#f59e0b"
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(245,158,11,0.3)"
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,158,11,0.4)"
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)"
            }}
        >
            ?
        </button>
    )
}
