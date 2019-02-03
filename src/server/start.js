// @ts-ignore
const tsNode = require('ts-node')
const dotEnv = require('dotenv')

dotEnv.config()

tsNode.register({
	transpileOnly: true,
	compilerOptions: {
		module: 'commonjs',
	}
})

const start = require('./index').default

start()
	.catch((e) => {
		console.error(e)
		process.exit(0)
	})

