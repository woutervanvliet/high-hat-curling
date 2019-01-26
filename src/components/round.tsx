import * as React from 'react'
import {useRound, useRoundPlayers, useTournament, useTournamentPlayers} from "../data/selectors";
import {useAction} from "../data/data-provider";
import {ChangeEvent, useState} from "react";
import {Game, Player} from "../data/data";
import uuid from 'uuid/v4'

function createGame(players: string[], roundId: string): Game {
    // Randomize which team gets most players
    const half = Math.random() > 0.5
        ? Math.ceil(players.length / 2)
        : Math.floor(players.length / 2)

    return {
        id: uuid(),
        bluePlayers: players.slice(0, half),
        redPlayers: players.slice(half),
        roundId: roundId,
        started: Date.now(),
    }
}

export function calculateGames(players: string[], roundId: string): Game[] {
    const games: Game[] = []
    const now = Date.now()
    const availablePlayers = players.slice()

    const pickPlayers = (num: number) => {
        const players: string[] = []
        for(let i = 0; i < num && availablePlayers.length > 0; i++) {
            const index = Math.floor(Math.random() * availablePlayers.length)
            players.push(
                ...availablePlayers.splice(index, 1)
            )
        }
        return players
    }

    while(availablePlayers.length > 0) {
        let usePlayers: string[] | undefined = undefined
        if (availablePlayers.length <= 9) {
            usePlayers = pickPlayers(players.length)
        } else if (availablePlayers.length === 10 || availablePlayers.length === 11) {
            usePlayers = pickPlayers(4)
        } else {
            usePlayers = pickPlayers(8)
        }
        games.push(createGame(usePlayers, roundId))
    }

    return games
}

function useCalculateGames(players: Player[], roundId: string): [Game[], (() => void)] {
    const [games, setGames] = useState([] as Game[])

    const calculate = (): void => {
        const games = calculateGames(players.map(p => p.id), roundId);
        setGames(games)
    }

    return [
        games,
        calculate,
    ]

}

export default function Round(props: { roundId: string }) {
    const round = useRound(props.roundId)
    const tournament = useTournament(round.tournamentId)
    const roundPlayers = useRoundPlayers(props.roundId)
    const tournamentPlayers = useTournamentPlayers(round.tournamentId)
    const addPlayerToRound = useAction('addPlayerToRound')
    const removePlayerFromRound = useAction('removePlayerFromRound')
    const [games, calculate] = useCalculateGames(roundPlayers, props.roundId)

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const playerId = event.target.dataset['playerId'] as string
        if (event.target.checked) {
            addPlayerToRound(playerId, props.roundId)
        } else {
            removePlayerFromRound(playerId, props.roundId)
        }
    }

    return (
        <div className="rounds">
            <h1>Round: {round.date} @ {tournament.name}</h1>
            <pre>{JSON.stringify(games, null, 4)}</pre>
            <ul>
                {tournamentPlayers.map((player) => {
                    const takesPart = round.players.includes(player.id)
                    return (
                        <li key={player.id}>
                            <label>
                                <input
                                    data-player-id={player.id}
                                    type="checkbox"
                                    name={`${round.id}_${player.id}`}
                                    onChange={onChange}
                                    checked={takesPart}
                                />
                                {player.name}
                            </label>
                        </li>
                    );
                })}
            </ul>
            <button onClick={calculate}>Create games</button>
        </div>
    )
}