const { commonConstruct, parseQueryString, maybe_bool } = require("../index.js");
const { PROXY_TYPE, TROJAN_DEFAULT_GROUP } = require("../consts.js");

function parse(link) {
  const PREFIX = 'trojan://';
  if (!link.startsWith(PREFIX)) {
    throw new Error('Invalid trojan link');
  }
  var trojan = link.substr(PREFIX.length);
  var server = '', port = '', psk = '', addition = '', group = '', remark = '', host = '', path = '', network = '', tfo, scv;
  [trojan, remark] = trojan.split('#');
  if (remark) {
    remark = decodeURIComponent(remark);
  }
  [trojan, addition] = trojan.split('?');
  remark || (remark = '');
  addition || (addition = '');
  let mat = /(?<psk>.*?)@(?<server>.*):(?<port>.*)/.exec(trojan);
  if (!mat) {
    return null;
  }
  ({psk, server, port} = mat.groups);
  if (port === '0') {
    return null;
  }
  const params = parseQueryString(addition);
  host = params.sni || params.peer;
  tfo = maybe_bool(params.tfo);
  scv = maybe_bool(params.allowInsecure);
  group = atob(params.group);
  if (params.ws === '1') {
    path = params.wspath;
    network = 'ws';
  }
  remark || (remark = `${server}:${port}`);
  group || (group = TROJAN_DEFAULT_GROUP);

  return {group, remark, server, port, psk, network, host, path, tlssecure: true, udp: null, tfo, scv}
}

function trojanConstruct(group, remarks, server, port, password, network, host, path, tlssecure, udp, tfo, scv, tls13) {
  const node = commonConstruct(PROXY_TYPE.Trojan, group, remarks, server, port, udp, tfo, scv, tls13);
  node.Password = password;
  node.Host = host;
  node.TLSSecure = tlssecure;
  node.TransferProtocol = !network ? "tcp" : network;
  node.Path = path;

  return node;
}

function trojan(link) {
  const parsed = parse(link);
  if (!parsed) {
    return null;
  }
  const {group, remark, server, port, psk, network, host, path, tlssecure, udp, tfo, scv} = parsed;
  return trojanConstruct(group, remark, server, port, psk, network, host, path, tlssecure, udp, tfo, scv);
}

exports = module.exports = {
  trojanConstruct,
  trojan,
}