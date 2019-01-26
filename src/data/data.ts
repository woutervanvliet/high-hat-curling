import { ActionType } from "typesafe-actions";
import * as actions from './actions'

export type Actions = typeof actions
export type ValidAction = ActionType<Actions>

export type Store = {
    tournaments: {
        [tournamentId: string]: Tournament,
    }
    rounds: {
        [roundId: string]: Round,
    },
    games: {
        [gameId: string]: Game,
    }
    players: {
        [playerId: string]: Player,
    }
}

export type Tournament = {
    id: string,
    name: string,
    rounds: string[],
    players: string[],
}

export type Round = {
    id: string,
    tournamentId: string,
    date: number,
    players: string[]
    games: string[],
}

export type Player = {
    id: string,
    name: string,
}

export type Game = {
    id: string,
    started?: number,
    roundId: string,
    bluePlayers: string[],
    redPlayers: string[],
    score?: {
        red: number,
        blue: number,
    }
}

const keysIn = (keys: string[], validKeys: string[]) => {
    return keys.filter((key) => validKeys.includes(key))
}

export function importState(state: Store): Store {
    const newState: Store = {
        rounds: state.rounds,
        players: state.players,
        tournaments: state.tournaments,
        games: state.games,
    }

    Object.values(state.rounds).forEach((round) => {
        round.players = keysIn(round.players, Object.keys(state.players))
    })

    Object.values(state.tournaments).forEach((tournament) => {
        tournament.players = keysIn(tournament.players, Object.keys(state.players))
    })

    return newState
}

const unique = (values: string[]) => {
    return Array.from(new Set(values))
}

export const reducer = (state: Store, action: ValidAction): Store => {
    switch (action.type) {
        case 'addTournament': return {
            ...state,
            tournaments: {
                ...state.tournaments,
                [action.payload.id]: {
                    name: action.payload.name,
                    id: action.payload.id,
                    rounds: [],
                    players: [],
                }

            }
        }
        case 'addRound': {
            const {
                tournamentId,
                date,
                id,
            } = action.payload

            return {
                ...state,
                tournaments: {
                    ...state.tournaments,
                    [tournamentId]: {
                        ...state.tournaments[tournamentId],
                        rounds: unique([
                            ...state.tournaments[tournamentId].rounds,
                            id,
                        ])
                    }
                },
                rounds: {
                    ...state.rounds,
                    [id]: {
                        id: id,
                        tournamentId: tournamentId,
                        date: date,
                        players: [],
                        games: [],
                    }
                }
            }
        }

        case 'addPlayer': return {
            ...state,
            players: {
                ...state.players,
                [action.payload.id]: {
                    id: action.payload.id,
                    name: action.payload.name,
                }
            }
        }

        case 'addPlayerToTournament': {
            const { tournamentId, playerId } = action.payload
            return {
                ...state,
                tournaments: {
                    ...state.tournaments,
                    [tournamentId]: {
                        ...state.tournaments[tournamentId],
                        players: unique([
                            ...state.tournaments[tournamentId].players,
                            playerId,
                        ])
                    }
                }
            }
        }

        case 'addPlayerToRound': {
            const { roundId, playerId } = action.payload
            return {
                ...state,
                rounds: {
                    ...state.rounds,
                    [roundId]: {
                        ...state.rounds[roundId],
                        players: unique([
                            ...state.rounds[roundId].players,
                            playerId,
                        ])
                    }
                }
            }
        }

        case 'removePlayerFromRound': {
            const { roundId, playerId } = action.payload

            return {
                ...state,
                rounds: {
                    ...state.rounds,
                    [roundId]: {
                        ...state.rounds[roundId],
                        players: state.rounds[roundId].players.filter((id) => id !== playerId)
                    }
                }
            }
        }

        case 'startRound': {
            const { roundId, games, date } = action.payload

            const round = state.rounds[roundId]
            const stateGames = games.reduce((result, game) => (
                {
                    ...result,
                    [game.id]: {
                        ...game,
                        started: date,
                    }
                }
            ), state.games)

            return {
                ...state,
                games: stateGames,
                rounds: {
                    ...state.rounds,
                    [roundId]: {
                        ...round,
                        games: games.map(game => game.id),
                    }
                }
            }
        }

        case 'updateGameScore': {
            const { gameId, score } = action.payload
            const game = state.games[gameId]

            return {
                ...state,
                games: {
                    ...state.games,
                    [gameId]: {
                        ...game,
                        score,
                    }
                }
            }
        }
    }

    return state
}

