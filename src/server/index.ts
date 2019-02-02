import express from 'express'
import makeApiRoute from './api'
import {Db, MongoClient} from "mongodb";

async function getDatabase(url: string, dbName: string) {
	return new Promise<Db>((resolve, reject) => {
		const client = new MongoClient(url, { useNewUrlParser: true })
		client.connect((error) => {
			if (error) {
			    return reject(error)
			}

			const db = client.db(dbName)

			resolve(db)
		})
	})
}

export default async function main() {
	if (typeof process.env.DB_STRING !== 'string') {
		throw new Error('Need DB_STRING')
	}

	const database = await getDatabase(process.env.DB_STRING, 'high-hat-curling-dev')
	const app = express()
	const port = 5000

	app.use('/api', makeApiRoute(database))

	app.listen(port, () => {
		console.log('Application now started')
	})
}

