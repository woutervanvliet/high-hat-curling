import express from 'express'
import bodyParser from 'body-parser'
import { reducer, Store } from '../data/data'
import { Db } from 'mongodb'

export default function api(database: Db) {
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

	app.use(bodyParser.json())

	app.get('/hello', (req, res) => {
		res.send('World')
	})

	app.get('/state', async (req, res) => {
	    res.json(await getState())
	})

	app.post('/reduce', async (req, res) => {
		console.log(req.body)

		const state = reducer(await getState(), req.body)

		collection.insertOne({
			...state,
			date: Date.now(),
		}, (err, result) => {
			console.log(JSON.stringify({ err, result }, null, 4))
		})

		res.json({
			ok: true,
		})
	})

	return app
}

