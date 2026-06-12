import { useState, useEffect } from "react"
import { UserService } from "@services/user.service"
import type { BasePvpFight } from "@shared/fight.types"

type UserID = string
type Username = string

export function useFightOpponentNames(fights: BasePvpFight[], playerId: string): Map<string, string> {
    const [names, setNames] = useState<Map<UserID, Username>>(new Map())

    useEffect(() => {
        if (fights.length === 0) return

        const opponentIdsWithDuplicates = fights.map(f => (f.playerUserId === playerId) ? f.opponentUserId : f.playerUserId)
        const opponentIds = [...new Set(opponentIdsWithDuplicates)]

        UserService.getByIds(opponentIds).then(users => {
            const map = new Map(users.map(u => [u._id, u.name]))
            setNames(map)
        })
    }, [fights, playerId])

    return names
}