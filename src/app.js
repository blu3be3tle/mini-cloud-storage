const express = require("express")
require("dotenv").config()

const fileRoutes = require("./routes/fileRoutes")

const app = express()

app.use(express.json())

app.use("/users", fileRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})