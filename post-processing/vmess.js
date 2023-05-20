
const {store_config, test_xray} = require('./utils')

async function test_openai(proxy, inbounds = null) {
  const {name, server, port, uuid, alterId, cipher, udp, network, tls, servername} = proxy
  const skip_cert_verify = proxy['skip-cert-verify']
  const http_opts = proxy['http-opts']
  const h2_opts = proxy['h2-opts']
  const grpc_opts = proxy['grpc-opts']
  const ws_opts = proxy['ws-opts']
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
        "protocol": "vmess",
        "settings": {
          "vnext": [
            {
              "address": server,
              "port": port,
              "users": [{
                "id": uuid,
                "alterId": alterId,
                "security": cipher
              }]
            }
          ]
        },
        "streamSettings": {
        }
      }
    ]
  }
  if (network) {
    config.outbounds[0].streamSettings.network = network
  }
  if (tls) {
    config.outbounds[0].streamSettings.security = "tls"
    config.outbounds[0].streamSettings.tlsSettings = {
      "serverName": servername,
      "allowInsecure": skip_cert_verify
    }
  }
  if (udp) {
    config.outbounds[0].streamSettings.sockopt = {
      "udp": true
    }
  }
  if (ws_opts) {
    config.outbounds[0].streamSettings.wsSettings = ws_opts
  }
  if (http_opts) {
    config.outbounds[0].streamSettings.httpSettings = http_opts
  }
  if (h2_opts) {
    config.outbounds[0].streamSettings.httpSettings = h2_opts
  }
  if (grpc_opts) {
    config.outbounds[0].streamSettings.grpcSettings = grpc_opts
  }
  const config_path = store_config(config)
  return await test_xray(config_path, name)
}

exports = module.exports = test_openai