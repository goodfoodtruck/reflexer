import { useEffect, useRef, useState } from "react"
import { type GuideStep } from "./useGuide"

type Props = {
    step:        GuideStep
    currentStep: number
    total:       number
    onNext:      () => void
    onPrev:      () => void
    onClose:     () => void
}

type Rect = { top: number; left: number; width: number; height: number }

export function GuideOverlay({ step, currentStep, total, onNext, onPrev, onClose }: Props) {
    const [targetRect,  setTargetRect]  = useState<Rect | null>(null)
    const [tooltipRect, setTooltipRect] = useState<Rect | null>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            const el = document.querySelector(step.target)
            if (el) {
                const rect = el.getBoundingClientRect()
                setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
            } else {
                setTargetRect(null)
            }
        }, 100)
        return () => clearTimeout(timer)
    }, [step.target])

    useEffect(() => {
        if (tooltipRef.current) {
            const r = tooltipRef.current.getBoundingClientRect()
            setTooltipRect({ top: r.top, left: r.left, width: r.width, height: r.height })
        }
    }, [targetRect])

    const positionStyle = getTooltipPosition(targetRect, step.position)
    const safeStyle     = clampToViewport(positionStyle, tooltipRect)

    return (
        <>
            <div style={STYLES.overlay} onClick={onClose}>
                <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                    <defs>
                        <mask id="guide-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {targetRect && (
                                <rect
                                    x={targetRect.left - 8}
                                    y={targetRect.top  - 8}
                                    width={targetRect.width  + 16}
                                    height={targetRect.height + 16}
                                    rx="8"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#guide-mask)" />
                </svg>

                {targetRect && (
                    <div style={{
                        ...STYLES.highlight,
                        top:    targetRect.top    - 8,
                        left:   targetRect.left   - 8,
                        width:  targetRect.width  + 16,
                        height: targetRect.height + 16,
                    }} />
                )}
            </div>

            <div
                ref={tooltipRef}
                onClick={e => e.stopPropagation()}
                style={{ ...STYLES.tooltip, ...safeStyle }}
            >
                <div style={STYLES.header}>
                    <div>
                        <div style={STYLES.label}>
                            GUIDE · {currentStep + 1}/{total}
                        </div>
                        <div style={STYLES.title}>
                            {step.title}
                        </div>
                    </div>
                    <button onClick={onClose} style={STYLES.closeBtn}>
                        ×
                    </button>
                </div>

                <p style={STYLES.description}>
                    {step.description}
                </p>

                <div style={STYLES.dotsRow}>
                    {Array.from({ length: total }).map((_, i) => (
                        <div key={i} style={i === currentStep ? STYLES.dotActive : STYLES.dotInactive} />
                    ))}
                </div>

                <div style={STYLES.buttonsRow}>
                    {currentStep > 0 && (
                        <button onClick={onPrev} style={STYLES.btnPrev}>
                            RETOUR
                        </button>
                    )}
                    <button onClick={onNext} style={STYLES.btnNext}>
                        {currentStep < total - 1 ? "SUIVANT" : "TERMINER"}
                    </button>
                </div>

                <div style={STYLES.skipRow}>
                    <button onClick={onClose} style={STYLES.skipBtn}>
                        Passer le guide
                    </button>
                </div>
            </div>
        </>
    )
}

function getTooltipPosition(rect: Rect | null, position: GuideStep["position"]): React.CSSProperties {
    if (! rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }

    const gap = 20
    switch (position) {
        case "top":    return { top: rect.top - gap,               left: rect.left + rect.width / 2,   transform: "translate(-50%, -100%)" }
        case "bottom": return { top: rect.top + rect.height + gap, left: rect.left + rect.width / 2,   transform: "translateX(-50%)" }
        case "left":   return { top: rect.top + rect.height / 2,   left: rect.left - gap,              transform: "translate(-100%, -50%)" }
        case "right":  return { top: rect.top + rect.height / 2,   left: rect.left + rect.width + gap, transform: "translateY(-50%)" }
    }
}

function clampToViewport(style: React.CSSProperties, tooltipRect: Rect | null): React.CSSProperties {
    if (! tooltipRect) return style

    const margin = 16
    const vw     = window.innerWidth
    const vh     = window.innerHeight
    const result = { ...style }

    if (tooltipRect.top + tooltipRect.height > vh - margin) {
        result.top       = Math.max(margin, vh - tooltipRect.height - margin)
        result.transform = "none"
    }

    if (tooltipRect.left + tooltipRect.width > vw - margin) {
        result.left      = vw - tooltipRect.width - margin
        result.transform = "none"
    }

    if ((tooltipRect.left as number) < margin) {
        result.left      = margin
        result.transform = "none"
    }

    return result
}

const STYLES = {
    overlay: {
        position: "fixed" as const,
        inset:    0,
        zIndex:   9998,
    },
    highlight: {
        position:      "fixed" as const,
        borderRadius:  "8px",
        border:        "2px solid #f59e0b",
        boxShadow:     "0 0 16px rgba(245,158,11,0.4)",
        pointerEvents: "none" as const,
        zIndex:        9999,
    },
    tooltip: {
        position:     "fixed" as const,
        zIndex:       10000,
        background:   "#12192b",
        border:       "1px solid rgba(245,158,11,0.3)",
        borderRadius: "12px",
        padding:      "24px",
        width:        "320px",
        boxShadow:    "0 8px 32px rgba(0,0,0,0.6)",
        fontFamily:   "inherit",
    },
    header: {
        display:        "flex" as const,
        justifyContent: "space-between" as const,
        alignItems:     "flex-start" as const,
        marginBottom:   "12px",
    },
    label: {
        fontSize:      "11px",
        color:         "#f59e0b",
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        marginBottom:  "4px",
    },
    title: {
        fontSize:   "18px",
        fontWeight: 700,
        color:      "#ffffff",
    },
    closeBtn: {
        background: "none",
        border:     "none",
        color:      "#6b7280",
        cursor:     "pointer",
        fontSize:   "20px",
        lineHeight: 1,
        padding:    "0 0 0 8px",
    },
    description: {
        fontSize:   "14px",
        color:      "#9ca3af",
        lineHeight: 1.6,
        margin:     "0 0 20px 0",
    },
    dotsRow: {
        display:      "flex" as const,
        gap:          "6px",
        marginBottom: "20px",
    },
    dotActive: {
        width:        "20px",
        height:       "6px",
        borderRadius: "3px",
        background:   "#f59e0b",
        transition:   "all 0.2s ease",
    },
    dotInactive: {
        width:        "6px",
        height:       "6px",
        borderRadius: "3px",
        background:   "#374151",
        transition:   "all 0.2s ease",
    },
    buttonsRow: {
        display: "flex" as const,
        gap:     "8px",
    },
    btnPrev: {
        flex:          1,
        padding:       "10px",
        background:    "transparent",
        border:        "1px solid #374151",
        borderRadius:  "8px",
        color:         "#9ca3af",
        cursor:        "pointer",
        fontSize:      "13px",
        letterSpacing: "0.05em",
    },
    btnNext: {
        flex:          1,
        padding:       "10px",
        background:    "#f59e0b",
        border:        "none",
        borderRadius:  "8px",
        color:         "#000",
        cursor:        "pointer",
        fontSize:      "13px",
        fontWeight:    700,
        letterSpacing: "0.05em",
    },
    skipRow: {
        textAlign: "center" as const,
        marginTop: "12px",
    },
    skipBtn: {
        background:    "none",
        border:        "none",
        color:         "#4b5563",
        cursor:        "pointer",
        fontSize:      "12px",
        letterSpacing: "0.05em",
    },
}