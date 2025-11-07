const { ss } = require('./ss.js');
const { ssr } = require('./ssr.js');
const { vmess } = require('./vmess.js');
const { trojan } = require('./trojan.js');
const { make_remark_unique, parseQueryString } = require('../index.js');
const { PROXY_TYPE } = require('../consts.js');

const clashr_protocols = ["origin", "auth_sha1_v4", "auth_aes128_md5", "auth_aes128_sha1", "auth_chain_a", "auth_chain_b"];
const clashr_obfs = ["plain", "http_simple", "http_post", "random_head", "tls1.2_ticket_auth", "tls1.2_ticket_fastauth"];
const clash_ssr_ciphers = ["rc4-md5", "aes-128-ctr", "aes-192-ctr", "aes-256-ctr", "aes-128-cfb", "aes-192-cfb", "aes-256-cfb", "chacha20-ietf", "xchacha20", "none"];

/**
 * 
 * @param {String} link ss/ssr/vmess/trojan subscription link
 */
function link2node(link) {
  if (link.startsWith('ss://')) {
    return ss(link);
  } else if (link.startsWith('ssr://')) {
    return ssr(link);
  } else if (link.startsWith('vmess://') || link.startsWith('vmess1://')) {
    return vmess(link);
  } else if (link.startsWith('trojan://')) {
    return trojan(link);
  }
  return null;
}

/**
 * @typedef {Object} Node
 * @property {String} Type
 * @property {String} Group
 * @property {String} Remark
 * @property {String} Hostname
 * @property {Number} Port
 * @property {Boolean} UDP
 * @property {Boolean} TCPFastOpen
 * @property {Boolean} AllowInsecure
 * @property {Boolean} TLS13
 * @property {String} Password
 * @property {String} EncryptMethod
 * @property {String} Plugin
 * @property {String} PluginOption
 * @property {String} Protocol
 * @property {String} ProtocolParam
 * @property {String} OBFS
 * @property {String} OBFSParam
 * @property {String} UserId
 * @property {Number} AlterId
 * @property {String} TransferProtocol
 * @property {String} Edge
 * @property {String} ServerName
 * @property {String} QUICSecure
 * @property {String} QUICSecret
 * @property {String} Host
 * @property {String} Path
 * @property {String} FakeType
 * @property {Boolean} TLSSecure
 */

/**
 * 
 * @param {Node} x 
 */
function add_proxy_from_node(x, proxies, clashR = false) {
  var type = x.Type;
  var remark, pluginopts = (x.PluginOption??'').replaceAll(";", "&"), singleproxy = {};
  x.Remark = make_remark_unique(`[${type}] ${x.Remark}`, proxies);

  singleproxy.name = x.Remark;
  singleproxy.server = x.Hostname;
  singleproxy.port = x.Port;

  switch(x.Type) {
    case PROXY_TYPE.Shadowsocks:
      if (x.EncryptMethod === 'chacha20') {
        return;
      }
      singleproxy.type = 'ss';
      singleproxy.cipher = x.EncryptMethod;
      singleproxy.password = x.Password;
      if (['simple-obfs', 'obfs-local"_hash'].indexOf(x.Plugin) >= 0) {
        singleproxy.plugin = 'obfs';
        const params = parseQueryString(pluginopts);
        singleproxy['plugin-opts'] = {
          mode: decodeURIComponent(params.obfs),
          host: decodeURIComponent(params['obfs-host'])
        }
      } else if (x.Plugin === 'v2ray-plugin') {
        singleproxy.plugin = "v2ray-plugin";
        const params = parseQueryString(pluginopts);
        singleproxy['plugin-opts'] = {
          mode: params.mode,
          host: params.host,
          path: params.path,
          tls: params.hasOwnProperty('tls'),
          mux: params.hasOwnProperty('mux')
        }
        if (x.AllowInsecure === false || x.AllowInsecure === true) {
          singleproxy["plugin-opts"]["skip-cert-verify"] = x.AllowInsecure;
        }
      }
      break;
    case PROXY_TYPE.ShadowsocksR:
      if (!clashR && clash_ssr_ciphers.indexOf(x.EncryptMethod) < 0) {
        return;
      }
      if (clashr_protocols.indexOf(x.Protocol) < 0) {
        return;
      }
      if (clashr_obfs.indexOf(x.OBFS) < 0) {
        return;
      }
      singleproxy.type = "ssr";
      singleproxy.cipher = x.EncryptMethod == "none" ? "dummy" : x.EncryptMethod;
      singleproxy.password = x.Password;
      singleproxy.protocol = x.Protocol;
      singleproxy.obfs = x.OBFS;
      if(clashR)
      {
        singleproxy["protocolparam"] = x.ProtocolParam;
        singleproxy["obfsparam"] = x.OBFSParam;
      }
      else
      {
        singleproxy["protocol-param"] = x.ProtocolParam;
        singleproxy["obfs-param"] = x.OBFSParam;
      }
      break;
    case PROXY_TYPE.VMess:
      singleproxy.type = "vmess";
      singleproxy.uuid = x.UserId;
      singleproxy.alterId = x.AlterId;
      singleproxy.cipher = x.EncryptMethod;
      singleproxy.tls = x.TLSSecure;
      if (x.AllowInsecure === true || x.AllowInsecure === false) {
        singleproxy["skip-cert-verify"] = x.AllowInsecure;
      }
      if(x.ServerName) {
        singleproxy.servername = x.ServerName;
      }
      if (x.TransferProtocol === 'tcp') {
        // do nothing
      } else if (x.TransferProtocol === 'ws') {
        singleproxy.network = x.TransferProtocol;
        singleproxy["ws-path"] = x.Path;
        if(x.Host) {
          singleproxy["ws-headers"] || (singleproxy["ws-headers"] = {});
          singleproxy["ws-headers"]["Host"] = x.Host;
        }
        if(x.Edge) {
          singleproxy["ws-headers"] || (singleproxy["ws-headers"] = {});
          singleproxy["ws-headers"]["Edge"] = x.Edge;
        }
        singleproxy["ws-opts"] = {};
        singleproxy["ws-opts"]["path"] = x.Path;
        if (x.Host) {
          singleproxy["ws-opts"]["headers"] || (singleproxy["ws-opts"]["headers"] = {});
          singleproxy["ws-opts"]["headers"]["Host"] = x.Host;
        }
        if (x.Edge) {
          singleproxy["ws-opts"]["headers"] || (singleproxy["ws-opts"]["headers"] = {});
          singleproxy["ws-opts"]["headers"]["Edge"] = x.Edge;
        }
      } else if (x.TransferProtocol === 'http') {
        singleproxy.network = x.TransferProtocol;
        singleproxy["http-opts"] = {
          method: "GET",
          path: [x.Path]
        };
        if (x.Host) {
          singleproxy["http-opts"]["headers"] || (singleproxy["http-opts"]["headers"] = {});
          singleproxy["http-opts"]["headers"]["Host"] = [x.Host];
        }
        if (x.Edge) {
          singleproxy["http-opts"]["headers"]["Edge"] = [x.Edge];
        }
      } else if (x.TransferProtocol === 'h2') {
        singleproxy.network = x.TransferProtocol;
        singleproxy["h2-opts"] = {
          path: x.Path
        };
        if(x.Host) {
          singleproxy["h2-opts"]["host"] = [x.Host];
        }
      } else if (x.TransferProtocol === 'grpc') {
        singleproxy.network = x.TransferProtocol;
        singleproxy.servername = x.Host;
        singleproxy["grpc-opts"] = {
          "grpc-service-name": x.Path
        };
      } else {
        return;
      }
      break;
    case PROXY_TYPE.Trojan:
      singleproxy.type = "trojan";
      singleproxy.password = x.Password;
      if(x.Host) {
        singleproxy.sni = x.Host;
      }
      if(x.AllowInsecure === false || x.AllowInsecure === true) {
        singleproxy["skip-cert-verify"] = x.AllowInsecure;
      }
      if (x.TransferProtocol === 'grpc') {
        singleproxy.network = x.TransferProtocol;
        if(x.Path) {
          singleproxy["grpc-opts"] = {
            "grpc-service-name": x.Path
          }
        }
      } else if (x.TransferProtocol === 'ws') {
        singleproxy.network = x.TransferProtocol;
        singleproxy["ws-opts"] = {
          path: x.Path
        };
        if(x.Host) {
          singleproxy["ws-opts"]["headers"] = {
            Host: x.Host
          }
        }
      }
      break;
    default:
      return;
  }

  if (x.UDP) {
    singleproxy.udp = true;
  }
  proxies.push(singleproxy);
}

exports = module.exports = {
  link2node,
  add_proxy_from_node
}