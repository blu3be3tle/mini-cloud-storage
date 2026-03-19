
const pool = require("../db/pool")
const { STORAGE_LIMIT } = require("../utils/constants")

// upload File (with transaction + locking)
async function uploadFile(userId, fileName, size, hash) {
    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        // lock user rows to prevent race conditions
        const usageResult = await client.query(
            `SELECT COALESCE(SUM(size), 0) AS used
       FROM user_files
       WHERE user_id = $1 AND deleted_at IS NULL
       FOR UPDATE`,
            [userId]
        )

        const used = Number(usageResult.rows[0].used)

        if (used + size > STORAGE_LIMIT) {
            throw new Error("Storage limit exceeded")
        }

        // prevent duplicate file name
        const nameCheck = await client.query(
            `SELECT id FROM user_files
       WHERE user_id=$1 AND file_name=$2 AND deleted_at IS NULL`,
            [userId, fileName]
        )

        if (nameCheck.rows.length > 0) {
            throw new Error("File with same name already exists")
        }

        // deduplication (check file_hash)
        let fileId

        const fileResult = await client.query(
            `SELECT id FROM files WHERE file_hash=$1`,
            [hash]
        )

        if (fileResult.rows.length === 0) {
            const insertFile = await client.query(
                `INSERT INTO files(file_hash, size)
         VALUES ($1, $2)
         RETURNING id`,
                [hash, size]
            )
            fileId = insertFile.rows[0].id
        } else {
            fileId = fileResult.rows[0].id
        }

        // insert user file
        const insertUserFile = await client.query(
            `INSERT INTO user_files(user_id, file_id, file_name, size)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [userId, fileId, fileName, size]
        )

        await client.query("COMMIT")

        return insertUserFile.rows[0]
    } catch (err) {
        await client.query("ROLLBACK")
        throw err
    } finally {
        client.release()
    }
}

// delete File
async function deleteFile(userId, fileId) {
    const result = await pool.query(
        `UPDATE user_files
     SET deleted_at = NOW()
     WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL
     RETURNING *`,
        [fileId, userId]
    )

    if (result.rows.length === 0) {
        throw new Error("File not found")
    }

    return result.rows[0]
}

// storage Summary
async function getStorageSummary(userId) {
    const result = await pool.query(
        `SELECT 
        COALESCE(SUM(size), 0) AS used,
        COUNT(*) AS total_files
     FROM user_files
     WHERE user_id=$1 AND deleted_at IS NULL`,
        [userId]
    )

    const used = Number(result.rows[0].used)

    return {
        used_storage: used,
        remaining_storage: STORAGE_LIMIT - used,
        total_files: Number(result.rows[0].total_files),
    }
}

// list files
async function listFiles(userId) {
    const result = await pool.query(
        `SELECT id, file_name, size, uploaded_at
     FROM user_files
     WHERE user_id=$1 AND deleted_at IS NULL
     ORDER BY uploaded_at DESC`,
        [userId]
    )

    return result.rows
}

module.exports = {
    uploadFile,
    deleteFile,
    getStorageSummary,
    listFiles,
}