const fs = require('fs')
const crypto = require('crypto-random-string')

const uploadFile = async file => {
  try {
    const { createReadStream, filename, mimetype } = await file
    const uploadDirectoryName = 'dist/uploads'
    const hashedFilename = `${crypto(4)}_${filename}`
    if(!fs.existsSync(uploadDirectoryName)) fs.mkdirSync(uploadDirectoryName, { recursive: true })
    const uploadPath = `${uploadDirectoryName}/${hashedFilename}`
    const stream = createReadStream()
    const uploadedFile = await stream.pipe(fs.createWriteStream(uploadPath))
    if(!uploadedFile) throw new Error('Error uploading attached file')
    return Promise.resolve({ path: uploadPath, filename, mimetype })
  } catch (err) {
    throw err
  }
}

module.exports = { uploadFile }
