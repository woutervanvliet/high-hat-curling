export function addTournament(id: string, name: string) {
    return {
        type: 'addTournament' as 'addTournament',
        payload: {
            id,
            name,
        }
    }
}

/**
 * Adds a round
 * @param tournamentId Tournament id to associate to
 * @param id New id of this round
 * @param date Date, as epoch milliseconds
 */
export function addRound(tournamentId: string, id: string, date: number) {
    return {
        type: 'addRound' as 'addRound',
        payload: {
            id,
            tournamentId,
            date,
        }
    }
}

export function addPlayer(id: string, name: string) {
    return {
        type: 'addPlayer' as 'addPlayer',
        payload: {
            id,
            name,
        }
    }
}

export function addPlayerToTournament(playerId: string, tournamentId: string) {
    return {
        type: 'addPlayerToTournament' as 'addPlayerToTournament',
        payload: {
            playerId,
            tournamentId,
        }
    }
}