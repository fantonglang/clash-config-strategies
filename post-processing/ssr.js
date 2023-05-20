
const {store_config, test_xray} = require('./utils')

async function test_openai(proxy, inbounds = null) {
  const {name, server, port, password, cipher, obfs, protocol, udp} = proxy
  const obfs_param = proxy['obfs-param']
  const protocol_param = proxy['protocol-param']
  inbounds || (inbounds = [
    {
      "port": 8001,
      "protocol": "http",
      "settings": {
        "allowTransparent": false
      }
    }
  ]);
  const config = {
    "inbounds": inbounds,
    "outbounds": [
      {
        "protocol": "shadowsocks",
        "settings": {
          "servers": [
            {
              "address": server,
              "port": port,
              "method": cipher,
              "password": password,
              "obfs": obfs,
              "obfs-param": obfs_param,
              "protocol": protocol,
              "protocol-param": protocol_param,
              "udp": udp
            }
          ]
        }
      }
    ]
  }
  const config_path = store_config(config)
  return await test_xray(config_path, name)
}

exports = module.exports = test_openai