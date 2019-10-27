const getUrls = require('get-urls')
const urlMetadata = require('url-metadata')

const getMetadataList = async content => {
  try {

    // Get urls in content
    const urlListInContent = Array.from(getUrls(content))
    if(urlListInContent.length===0) return Promise.resolve(null)
    
    // Get list of metadata
    const metadataPromises = urlListInContent.map( async targetUrl => {
      const { url, title, image, author, description } = await urlMetadata(targetUrl) 
      return { url, title, image, author, description }
    })
    const metadataList = await Promise.all(metadataPromises)

    return Promise.resolve(metadataList)

  } catch (err) {
    throw err
  }
}

module.exports = { getMetadataList }
