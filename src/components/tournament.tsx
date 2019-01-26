import * as React from 'react'
import {useAction, useStore} from "../data/data-provider";
import {Redirect} from "react-router";
import {Link} from "react-router-dom";
import uuid from "uuid/v4"
import {Formik, Form, Field} from "formik";
import {useTournament, useRound} from "../data/selectors";

function RoundLink (props: { id: string}) {
    const round = useRound(props.id)

    return (
        <Link to={`/${round.tournamentId}/${round.id}`}>Round: {round.date} ({round.players.length} players}</Link>
    )
}

function PlayerLink (props: { id: string }) {
    const player = useStore((store) => store.players[props.id])

    return <Link to={`/player/${player.id}`}>{player.name}</Link>
}

function AddPlayer(props: { tournamentId: string }) {
    const addPlayer = useAction('addPlayer')
    const addPlayerToTournament = useAction('addPlayerToTournament')
    const players = useStore((store) => Object.values(store.players))
    const tournament = useTournament(props.tournamentId)

    return (
        <Formik
            initialValues={{ name: '', selectedPlayer: '', tournamentId: props.tournamentId, }}
            onSubmit={
                (values, formik) => {
                    if (values.selectedPlayer === 'writeIn' && values.name) {
                        const playerId = uuid()
                        addPlayer(playerId, values.name)
                        addPlayerToTournament(playerId, values.tournamentId)
                        formik.resetForm({
                            name: '',
                            selectedPlayer: 'writeIn',
                            tournamentId: values.tournamentId,
                        })
                    } else if (values.selectedPlayer !== 'writeIn') {
                        addPlayerToTournament(values.selectedPlayer, values.tournamentId)
                        formik.resetForm()
                    } else {
                        formik.setSubmitting(false)
                    }
                }
            }
        >{
                ({ isSubmitting, values }) => (<Form>
                    <Field component="select" name="selectedPlayer">
                        <option value="" disabled>Select a player</option>
                        <optgroup label="Create a new player">
                            <option value="writeIn">Create new</option>
                        </optgroup>
                        <optgroup label="Select existing player">
                            {players.map((player) => (
                                <option
                                    key={player.id}
                                    value={player.id}
                                    disabled={tournament.players.includes(player.id)}
                                >
                                    {player.name}
                                </option>
                            ))}
                        </optgroup>
                    </Field>
                    {values.selectedPlayer === 'writeIn' && (
                        <Field type="text" name="name" autocomplete="off" />
                    )}
                    <button type="submit">Add player</button>
                </Form>)
            }</Formik>
    )
}

function AddRound(props: { tournamentId: string}) {
    const addRound = useAction('addRound')
    const id = uuid()

    return <button onClick={() => addRound(props.tournamentId, id, Date.now())}>Add round</button>
}

export default function Tournament(props: { tournamentId: string }) {
    const tournament = useTournament(props.tournamentId)

    return (
        <div className="tournament">
            <h1>{tournament.name}</h1>
            <p>This is a tournament page.</p>

            <h2>Rounds</h2>
            <ul>
                {tournament.rounds.map(roundId => <li key={roundId}><RoundLink id={roundId} /></li>)}
                <li><AddRound tournamentId={props.tournamentId} /></li>
            </ul>

            <h2>Players</h2>
            <ul>
                {tournament.players.map(playerId => <li key={playerId}><PlayerLink id={playerId} /></li>)}
                <li><AddPlayer tournamentId={props.tournamentId} /></li>
            </ul>
        </div>
    )
}