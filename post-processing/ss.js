
const {store_config, test_xray} = require('./utils')

async function test_openai(proxy, inbounds = null) {
  const {name, server, port, password, cipher, udp, plugin} = proxy
  const plugin_opts = proxy['plugin-opts'];
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
              "udp": udp,
              "plugin": plugin,
              "plugin-opts": plugin_opts
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