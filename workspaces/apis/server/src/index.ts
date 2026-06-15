import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDatabase } from "./db"
import userRoutes   from "@routes/user.route"
import characterRoutes   from "@routes/character.route"
import gambitRoutes from "@routes/gambit.route"
import runRoutes    from "@routes/run.route"
import fightRoutes  from "@routes/fight"
import { createGameEngine } from "@reflexer/engine"
import { seedDatabase } from "@scripts/seedDatabase"
import authRoutes from "./routes/auth.route"
 
dotenv.config()

export const engine = createGameEngine()
 
const app = express()
app.use(cors())
app.use(express.json())
 
app.use("/users",      userRoutes)
app.use("/characters", characterRoutes)
app.use("/gambits",    gambitRoutes)
app.use("/runs",       runRoutes)
app.use("/fights",     fightRoutes)
app.use("/auth",    authRoutes)
 
app.get("/", (_, res) => res.json({ status: "ok", service: "reflexer-server" }))
 
const start = async () => {
    const uri  = process.env.MONGODB_URI ?? "mongodb://localhost:27017/reflexer"
    await connectDatabase(uri)
    await seedDatabase()
 
    const port = Number(process.env.PORT ?? 4000)
    app.listen(port, () => {
        console.log(`Reflexer server running on http://localhost:${port}`)
    })
}
 
start().catch(error => {
    console.error("Failed to start server:", error)
    process.exit(1)
})
 
