async function getContent(url) {
  console.log('Fetching links from:', url)
  const resp = await fetch(url)
  const text = await resp.text()
  return text
}

function parseBase64(base64) {
  return atob(base64)
}

function getLinkItems(content) {
  return content.replaceAll('\r', '').split('\n')
}

async function getLinks(url) {
  const base64 = await getContent(url)
  const content = parseBase64(base64)
  const items = getLinkItems(content)
  return items
}

exports = module.exports = {
  getLinks
}