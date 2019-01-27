import {useStore} from "./data-provider";

export function useTournament(id: string) {
    return useStore((store) => store.tournaments[id])
}

export function useRound(id: string) {
    return useStore(store => store.rounds[id])
}

export function usePlayer(playerId: string) {
    return useStore(store => store.players[playerId])
}

export function useTournamentPlayers (tournamentId: string) {
    const tournament = useTournament(tournamentId)

    return tournament
        .players
        .map((playerId) => usePlayer(playerId))
}

export function useTournamentResults(tournamentId: string) {
    const tournament = useTournament(tournamentId)
    const allGames = useStore((store) => Object.values(store.games))

    return tournament
        .players
        .map((playerId) => {
            const games = allGames
                .filter((game) => game.score)
                .filter((game) => game.bluePlayers.includes(playerId) || game.redPlayers.includes(playerId))

            const result = {
                wins: 0,
                draws: 0,
                losses: 0,
                stones: 0,
            }

            games.forEach(({ score = { red: 0, blue: 0 }, bluePlayers, redPlayers }) => {
                if (redPlayers.includes(playerId)) {
                    result.wins += score.red > score.blue ? 1 : 0
                    result.draws += score.red === score.blue ? 1 : 0
                    result.losses += score.red < score.blue ? 1 : 0
                    result.stones += score.red
                } else {
                    result.wins += score.blue > score.red ? 1 : 0
                    result.draws += score.blue === score.red ? 1 : 0
                    result.losses += score.blue < score.red ? 1 : 0
                    result.stones += score.blue
                }
            })

            return {
                player: usePlayer(playerId),
                gamesPlayed: games.length,
                ...result
            }
        })
}

export function useRoundPlayers(roundId: string) {
    const round = useRound(roundId)

    return round
        .players
        .map((playerId) => usePlayer(playerId))
}

export function useGame(gameId: string) {
    return useStore(store => store.games[gameId])
}

export function useRoundGames(roundId: string) {
    const round = useRound(roundId)

    return round
        .games
        .map((gameId) => useGame(gameId))

}

