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

