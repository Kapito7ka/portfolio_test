import postgres from 'postgres'
import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')

const sql = postgres(connectionString)

export default sql