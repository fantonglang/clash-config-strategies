const cyanmori = require('./cyanmori.js')
const juzi = require('./juzi.js')
const jms = require('./justmysocks')

exports = module.exports = function(proxy, prefix) {
  if (prefix === 'cyanmori') {
    return cyanmori(proxy)
  }
  if (prefix === 'juzi') {
    return juzi(proxy)
  }
  if (prefix === 'jms') {
    return jms(proxy)
  }
  return []
}