const express = require("express")
const router = express.Router()

const fileController = require("../controllers/fileController")

router.post("/:user_id/files", fileController.uploadFile)

router.delete("/:user_id/files/:file_id", fileController.deleteFile)

router.get("/:user_id/storage-summary", fileController.getStorageSummary)

router.get("/:user_id/files", fileController.listFiles)

module.exports = router