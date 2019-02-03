import express from 'express'
import makeApiRoute from './api'
import {Db, MongoClient} from "mongodb";
import http from 'http'
import io from 'socket.io'
import {ValidAction} from "../data/data";
import path from "path";

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
	const server = new http.Server(app)
	const socket = io(server, {
		serveClient: false,
		transports: ['websocket'],
	})

	const dispatch = (event: ValidAction) => {
		socket.emit('dispatch', {
			...event,
			serverTime: Date.now(),
		})
	}

	app.use('/api', await makeApiRoute(database, dispatch))
	const buildPath = path.join(__dirname, '../../build')

    app.use('/', express.static(buildPath, {
    	cacheControl: true,
        maxAge: '30d',
	}))

	server.listen(port, () => {
		console.log('Application now started')
	})
}

