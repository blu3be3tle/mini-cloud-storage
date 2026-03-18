const express = require("express")
const router = express.Router()

// test route
router.get("/", (req, res) => {
    res.send("File routes working")
})

module.exports = router