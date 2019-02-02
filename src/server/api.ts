import express from 'express'
import bodyParser from 'body-parser'
import {reducer, Store, ValidAction} from '../data/data'
import { Db } from 'mongodb'

export default async function api(database: Db, dispatch: (action: ValidAction) => void) {
	const app = express()
    const collection = database.collection('appState')

	const getState = () => {
		return new Promise<Store>((resolve, reject) => {
			const cursor = collection.find()
				.limit(1)
				.sort('date', -1)
				.toArray((err, results) => {
				    if (err) {
				    	return reject(err)
					}

				    if (results.length !== 1) {
				        resolve({
							tournaments: {},
							players: {},
							rounds: {},
							games: {},
						})
						return
					}

				    const {
				    	_id,
                        date,
						...state
					} = results[0]

				    resolve(state)
				})
		})
	}

	let state: Store = await getState()

	app.use(bodyParser.json())

	app.get('/hello', (req, res) => {
		res.send('World')
	})

	app.get('/state', async (req, res) => {
	    res.json(state)
	})

	app.post('/reduce', async (req, res) => {
		state = reducer(state, req.body)

		dispatch(req.body)

		collection.insertOne({
			...state,
			date: Date.now(),
		}, (error, result) => {
		    if (error) {
		    	res.status(500)
				res.json({ ok: false, error })
			} else {
				res.json({
					ok: true,
				})
			}
		})
	})

	return app
}

