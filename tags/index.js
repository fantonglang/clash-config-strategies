const cyanmori = require('./cyanmori.js')
const juzi = require('./juzi.js')
const jms = require('./justmysocks')
const vps = require('./vps.js')

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
  if (prefix === 'vps') {
    return vps(proxy)
  }
  return []
}