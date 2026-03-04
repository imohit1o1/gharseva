import express from "express"

const app = express()

// middleware
app.use(express.json())

// home route
app.get("/", (req, res) => {
    res.json({ status: "ok" })
})

// health check route
app.get("/health", (req, res) => {
    res.json({ status: "ok" })
})

export { app }