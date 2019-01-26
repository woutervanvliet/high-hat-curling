import * as React from 'react'
import {
    usePlayer,
    useRound,
    useRoundGames,
    useRoundPlayers,
    useTournament,
    useTournamentPlayers
} from "../data/selectors";
import {useAction} from "../data/data-provider";
import {ChangeEvent, useState} from "react";
import {Actions, Game, Player} from "../data/data";
import uuid from 'uuid/v4'
import styles from './styles.module.scss'

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

function PlayerPosition(props: { index: number, players: number, format: string }) {
    const { index, players, format } = props
    switch(format) {
        case 'doubles':
            if (players === 2) {
                return index === 0
                    ? <span>1st, stone 1, 4 and 5</span>
                    : <span>2nd, stones 2 and 3</span>
            } else if (players === 3) {
                if (index === 0) {
                    return <span>1st: stone 1 and 2</span>
                } else if (index === 1) {
                    return <span>2nd: stone 3 and 4</span>
                } else if (index === 2) {
                    return <span>3rd + skip: stone 5 and 6</span>
                }
            }
            break
        case 'normal':
            if (players === 3) {
                switch(index) {
                    case 0: return <span>1st, stones 1, 2 and 3</span>
                    case 1: return <span>2nd, stones 4, 5, and 6</span>
                    case 2: return <span>3rd and skip, stones 7 and 8</span>
                }
            } else if (players === 4) {
                switch(index) {
                    case 0: return <span>1st, stones 1 and 2</span>
                    case 1: return <span>2nd, stones 3 and 4</span>
                    case 2: return <span>3rd, stones 5 and 6</span>
                    case 3: return <span>4th and skip, stones 7 and 8</span>
                }
            } else if (players === 5) {
                switch(index) {
                    case 0: return <span>1st, stones 1 and 2</span>
                    case 1: return <span>2nd, stones 3 and 4</span>
                    case 2: return <span>3rd, stones 5 and 6</span>
                    case 3: return <span>4th, stones 7 and 8</span>
                    case 4: return <span>Skipper</span>
                }
            }
    }

    return <span>Unknown</span>
}

function GameTeam(props: { players: string[], format: string }) {
    return (
        <div className={styles.team}>{
            props.players.map( (playerId, index) => {
                const player = usePlayer(playerId)

                return <div key={player.id} className={styles.player}>
                    <b>{player.name}</b>
                    <div className={styles.position}>
                        <PlayerPosition
                            format={props.format}
                            index={index}
                            players={props.players.length}
                        />
                    </div>
                </div>
            })
        }</div>
    )
}

function GameSheet(props: Game & { index: number, updateScore?: Actions['updateGameScore']  }) {
    const format = props.redPlayers.length === 2 || props.bluePlayers.length === 2
        ? 'doubles'
        : 'normal'

    const score = props.score || { red: 0, blue: 0 }
    const [red, setRed] = useState(score.red)
    const [blue, setBlue] = useState(score.blue)
    const handleUpdate = () => props.updateScore && props.updateScore(props.id, { red, blue })

    return (
        <div className={styles.sheet}>
            <div className={styles.house} />
            <div className={styles.team}>
                <GameTeam
                    players={props.bluePlayers}
                    format={format}
                />
            </div>
            <div className={styles.team}>
                <GameTeam
                    players={props.redPlayers}
                    format={format}
                />
            </div>
            <div className={styles.score}>
                <label>
                    Stones
                    <input
                        value={blue}
                        type="number"
                        name="blueStones"
                        onChange={(event) => setBlue(parseInt(event.target.value, 10))}
                    />
                </label>
            </div>
            <div className={styles.score}>
                <label>
                    Stones
                    <input
                        value={red}
                        type="number"
                        name="redStones"
                        onChange={(event) => setRed(parseInt(event.target.value, 10))}
                    />
                </label>
            </div>
            <button
                className={styles.save}
                onClick={handleUpdate}
                disabled={blue === score.blue && red === score.red}
            >
                Save scores
            </button>
        </div>
    )
}

export default function Round(props: { roundId: string }) {
    const round = useRound(props.roundId)
    const tournament = useTournament(round.tournamentId)
    const roundPlayers = useRoundPlayers(props.roundId)
    const roundGames = useRoundGames(round.id)
    const tournamentPlayers = useTournamentPlayers(round.tournamentId)
    const addPlayerToRound = useAction('addPlayerToRound')
    const removePlayerFromRound = useAction('removePlayerFromRound')
    const startRound = useAction('startRound')
    const updateScore = useAction('updateGameScore')

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
            <div className={styles.lane}>
                {roundGames.map((game, index) => {
                    return <GameSheet
                        id={game.id}
                        index={index}
                        bluePlayers={game.bluePlayers}
                        redPlayers={game.redPlayers}
                        roundId={game.roundId}
                        started={game.started}
                        key={game.id}
                        updateScore={updateScore}
                        score={game.score}
                    />;
                })}
            </div>
            {roundGames.length === 0 && (<>
                <div className={styles.lane}>
                    {games.map((game, index) => {
                        return <GameSheet
                            id={game.id}
                            index={index}
                            bluePlayers={game.bluePlayers}
                            redPlayers={game.redPlayers}
                            roundId={game.roundId}
                            started={game.started}
                            key={game.id}
                        />;
                    })}
                </div>
                {games.length > 0 && (
                    <button onClick={() => startRound(round.id, games, Date.now())}>Start round</button>
                )}
                <h2>Available players</h2>
                <div className={styles.playerList}>
                    {tournamentPlayers.map((player) => {
                        const takesPart = round.players.includes(player.id)
                        return (
                            <label key={player.id}>
                                <input
                                    data-player-id={player.id}
                                    type="checkbox"
                                    name={`${round.id}_${player.id}`}
                                    onChange={onChange}
                                    checked={takesPart}
                                />
                                {player.name}
                            </label>
                        );
                    })}
                </div>
                {roundGames.length === 0 && (
                    <button disabled={roundPlayers.length < 4} onClick={calculate}>{
                        roundPlayers.length < 4
                            ? 'Select at least 4 players'
                            : 'Create games'
                    }</button>
                )}
            </>)}
        </div>
    )
}