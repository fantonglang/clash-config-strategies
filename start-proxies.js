const fs = require('fs');
const { v4: uuid_v4 } = require('uuid');
const YAML = require('yaml');
const { exec } = require('node:child_process');
const clash_path = 'https://clash.my-docs.org/final.yaml';

async function writeXrayConfig(start_port) {
  const proxies = (await getProxySettings()).filter(p => p.type === 'vmess' || p.type === 'ss');
  const config = {
    inbounds: [],
    outbounds: [],
    routing: {
      rules: []
    }
  };
  for (let i=0; i<proxies.length; i++) {
    const proxy = proxies[i];
    if (proxy.type === 'ss') {
      config.outbounds.push({
        tag: `outbound-${start_port + i}`,
        ...createSSOutbound(proxy)
      });
    } else if (proxy.type === 'vmess') {
      config.outbounds.push({
        tag: `outbound-${start_port + i}`,
        ...createVmessOutbound(proxy)
      });
    }
    config.inbounds.push({
      tag: `inbound-${start_port + i}`,
      port: start_port + i,
      protocol: 'http',
      settings: {
        allowTransparent: false
      }
    })
    config.routing.rules.push({
      type: 'field',
      outboundTag: `outbound-${start_port + i}`,
      inboundTag: [`inbound-${start_port + i}`]
    })
  }
  const config_path = `./temp/${uuid_v4()}.json`;
  fs.writeFileSync(config_path, JSON.stringify(config, null, 2));

  return config_path;
}

async function start(start_port) {
  const config_path = await writeXrayConfig(start_port);
  const ps = exec(`xray run -c ${config_path}`);
  ps.on('error', function(err) {
    console.error(err)
  })
  ps.stdout.on('data', function(data) {
    console.log(data);
  })
  console.log(`Xray started with config: ${config_path}`);
  // wait until control-c
  process.on('SIGINT', () => {
    console.log('Stopping Xray...');
    exec(`xray stop -c ${config_path}`, (err) => {
      console.log('Xray stopped successfully.');
      fs.unlinkSync(config_path);
      process.exit();
    });
  });
  console.log('Press Ctrl+C to stop Xray.');
}

async function getProxySettings() {
  const resp = await fetch(clash_path);
  if (!resp.ok) {
    return [];
  }
  const text = await resp.text();
  return (YAML.parse(text)).proxies || [];
}

function createSSOutbound(proxy) {
  const {name, server, port, password, cipher, udp, plugin} = proxy
  const plugin_opts = proxy['plugin-opts'];
  return {
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
}

function createVmessOutbound(proxy) {
  const {name, server, port, uuid, alterId, cipher, udp, network, tls, servername} = proxy
  const skip_cert_verify = proxy['skip-cert-verify']
  const http_opts = proxy['http-opts']
  const h2_opts = proxy['h2-opts']
  const grpc_opts = proxy['grpc-opts']
  const ws_opts = proxy['ws-opts']

  const outbound = {
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

  if (network) {
    outbound.streamSettings.network = network
  }
  if (tls) {
    outbound.streamSettings.security = "tls"
    outbound.streamSettings.tlsSettings = {
      "serverName": servername,
      "allowInsecure": skip_cert_verify
    }
  }
  if (udp) {
    outbound.streamSettings.sockopt = {
      "udp": true
    }
  }
  if (ws_opts) {
    outbound.streamSettings.wsSettings = ws_opts
  }
  if (http_opts) {
    outbound.streamSettings.httpSettings = http_opts
  }
  if (h2_opts) {
    outbound.streamSettings.httpSettings = h2_opts
  }
  if (grpc_opts) {
    outbound.streamSettings.grpcSettings = grpc_opts
  }

  return outbound;
}

start(9012)