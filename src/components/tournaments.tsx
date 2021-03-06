import * as React from 'react'
import uuid from 'uuid/v4'
import {useAction, useStore} from "../data/data-provider";
import {Formik, Form, Field, FormikBag} from 'formik'
import {Link} from "react-router-dom";

const initialTournament = {
    name: '',
}

function AddTournament() {
    const addTournament = useAction('addTournament')
    return (
        <Formik initialValues={initialTournament} onSubmit={(values, { setSubmitting, resetForm }) => {
            const id = uuid()
            addTournament(id, values.name)
            resetForm()
            setSubmitting(false)
        }}>
            {({ isSubmitting }) => (
                <Form>
                    <Field type="text" name="name" />
                    <button type="submit" disabled={isSubmitting}>Save</button>
                </Form>
            )}
        </Formik>
    )
}

export default function Tournaments() {
    const tournaments = useStore((store) => Object.values(store.tournaments))

    return (
        <div>
            <h2>Tournaments</h2>
            <ul>
                {
                    tournaments.map((tournament) => {
                        return (
                            <li key={tournament.id}><Link to={`/${tournament.id}`}>{tournament.name}</Link></li>
                        )
                    })
                }
                <AddTournament />
            </ul>
        </div>
    )
}