const test_openai_ss = require('./ss')
const test_openai_ssr = require('./ssr')

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
    default:
      return false
  }
}