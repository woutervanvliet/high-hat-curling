import * as actions from './actions'

type Actions = typeof actions
type ActionTypes = { [P in keyof Actions]: ReturnType<Actions[P]> }
export type ValidAction = ActionTypes['addTournament']

export type Store = {
    tournaments: {
        [tournamentId: string]: Tournament
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
}

export type Round = {
    id: string,
    tournamentId: string,
    date: number,
    players: string[]
}

export type Player = {
    id: string,
    name: string,
}

export type Game = {
    id: string,
    started: number,
    roundId: string,
    bluePlayers: string[],
    redPlayers: string[],
}

export const reducer = (state: Store, { type, payload }: ValidAction): Store => {
    switch(type) {
        case 'addTournament': return {
            ...state,
            tournaments: {
                ...state.tournaments,
                [payload.id]: {
                    rounds: [],
                    name: payload.name,
                    id: payload.id,
                }
            }
        }
    }

    return state
}

