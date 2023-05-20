const test_openai_ss = require('./ss')
const test_openai_ssr = require('./ssr')
const test_openai_vmess = require('./vmess')

exports = module.exports = async function(proxy) {
  const inbounds = [
    {
      "port": 8001,
      "protocol": "http",
      "settings": {
        "allowTransparent": false
      }
    }
  ]
  switch(proxy.type) {
    case 'ss':
      return await test_openai_ss(proxy, inbounds)
    case 'ssr':
      return await test_openai_ssr(proxy, inbounds)
    case 'vmess':
      return await test_openai_vmess(proxy, inbounds)
    default:
      return false
  }
}