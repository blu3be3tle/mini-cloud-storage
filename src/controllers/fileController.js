const fileService = require("../services/fileService")

// upload
async function uploadFile(req, res) {
    try {
        const userId = req.params.user_id
        const { file_name, size, file_hash } = req.body

        const file = await fileService.uploadFile(
            userId,
            file_name,
            size,
            file_hash
        )

        res.status(201).json(file)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

// delete
async function deleteFile(req, res) {
    try {
        const { user_id, file_id } = req.params

        const result = await fileService.deleteFile(user_id, file_id)

        res.json({ message: "File deleted", file: result })
    } catch (err) {
        res.status(404).json({ error: err.message })
    }
}

// summary
async function getStorageSummary(req, res) {
    try {
        const userId = req.params.user_id

        const summary = await fileService.getStorageSummary(userId)

        res.json(summary)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// list files
async function listFiles(req, res) {
    try {
        const userId = req.params.user_id

        const files = await fileService.listFiles(userId)

        res.json(files)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = {
    uploadFile,
    deleteFile,
    getStorageSummary,
    listFiles,
}