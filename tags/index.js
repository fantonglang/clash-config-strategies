const juzi = require('./juzi.js')
const jms = require('./justmysocks')
const vps = require('./vps.js')
const dog = require('./dog.js')

exports = module.exports = function(proxy, prefix) {
  if (prefix === 'juzi') {
    return juzi(proxy)
  }
  if (prefix === 'jms') {
    return jms(proxy)
  }
  if (prefix === 'vps') {
    return vps(proxy)
  }
  if (prefix === 'dog') {
    return dog(proxy)
  }
  return []
}