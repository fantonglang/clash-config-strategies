const { commonConstruct, parseQueryString, isIPv4, isIPv6 } = require("../index.js");
const { PROXY_TYPE, V2RAY_DEFAULT_GROUP } = require("../consts.js");

function parseShadowRocket(link) {
  const PREFIX = 'vmess://';
  if (!link.startsWith(PREFIX)) {
    throw new Error('Invalid ShadowRocket link');
  }
  var add = '', port = '', type = '', id = '', aid = '', net = "tcp", path = '', host = '', tls = '', cipher = '', remarks = '', obfs = '', addition = '', group = V2RAY_DEFAULT_GROUP, edge = '', sni = '';
  var rocket = link.substr(PREFIX.length);
  [rocket, addition] = rocket.split('?');
  let mat = /(?<cipher>.*?):(?<id>.*)@(?<add>.*):(?<port>.*)/.exec(atob(rocket));
  if (!mat) {
    return null;
  }
  ({cipher, id, add, port} = mat.groups);
  if (port === '0') {
    return null;
  }
  const params = parseQueryString(addition);
  remarks = decodeURIComponent(params.remarks);
  obfs = params.obfs;
  if (!obfs) {
    if (obfs === 'websocket') {
      net = 'ws';
      host = params.obfsParam;
      path = params.path;
    }
  } else {
    net = params.network;
    host = params.wsHost;
    path = params.wspath;
  }
  tls = params.tls === '1'? 'tls': '';
  aid = params.aid;
  if (!aid) {
    aid = '0';
  }
  if (!remarks) {
    remarks = `${add}:${port}`;
  }
  return {group, ps: remarks, add, port, type, id, aid, net, cipher, path, host, edge, tls, sni};
}

function parseStdVmess(link) {
  const PREFIX = 'vmess://';
  if (!link.startsWith(PREFIX)) {
    throw new Error('Invalid StdVmess link');
  }
  var add = '', port = '', type = '', id = '', aid = '', net = '', path = '', host = '', tls = '', remarks = '', addition = '', group = V2RAY_DEFAULT_GROUP, edge = '', sni = '';
  var vmess = link.substr(PREFIX.length);
  [vmess, remarks] = vmess.split('#');
  remarks = decodeURIComponent(remarks??'');
  let mat = /^(?<net>[a-z]+)(?:\+(?<tls>[a-z]+))?:(?<id>[\da-f]{4}(?:[\da-f]{4}-){4}[\da-f]{12})-(?<aid>\d+)@(?<add>.+):(?<port>\d+)(?:\/?\?(?<addition>.*))?$/.exec(vmess);
  if (!mat) {
    return null;
  }
  ({net, tls, id, aid, add, port, addition} = mat.groups);
  const params = parseQueryString(addition);
  switch (net) {
    case 'tcp':
    case 'kcp':
      type = params.type;
      break;
    case 'http':
    case 'ws':
      host = params.host;
      path = params.path;
      break;
    case 'quic':
      type = params.security;
      host = params.type;
      path = params.key;
      break;
    default:
      return null;
  }
  if (!remarks) {
    remarks = `${add}:${port}`;
  }
  return {group, ps: remarks, add, port, type, id, aid, net, cipher: "auto", path, host, edge, tls, sni};
}

function parseKitsunebi(link) {
  const PREFIX = 'vmess1://';
  if (!link.startsWith(PREFIX)) {
    throw new Error('Invalid kitsunebi link');
  }
  var add = '', port = '', type = '', id = '', aid = "0", net = "tcp", path = '', host = '', tls = '', cipher = "auto", remarks = '', addition = '', group = V2RAY_DEFAULT_GROUP, edge = '', sni = '';
  kit = link.substr(PREFIX.length);
  [kit, remarks] = kit.split('#');
  [kit, addition] = kit.split('?');
  let mat = /(?<id>.*?)@(?<add>.*):(?<port>.*)/.exec(kit);
  if (!mat) {
    return null;
  }
  ({id, add, port} = mat.groups);
  var pos = port.indexOf('/');
  if (pos > -1) {
    path = port.substr(pos);
    port = port.substr(0, pos);
  }
  if(port == "0") {
    return null;
  }
  var params = parseQueryString(addition);
  net = params.network;
  tls = params.tls === 'true'? 'tls': '';
  host = params['ws.host'];
  if (!remarks) {
    remarks = `${add}:${port}`;
  }
  return {group, ps: remarks, add, port, type, id, aid, net, cipher, path, host, edge, tls, sni};
}

function parseQuan(quan) {
  var strTemp = '', itemName = '', itemVal = '', group = V2RAY_DEFAULT_GROUP, ps = '', add = '', port = '', cipher = '', type = "none", id = '', aid = "0", net = "tcp", path = '', host = '', edge = '', tls = '', configs = [], vArray = [], headers = [], sni = '';
  strTemp = quan.replace(/(.*?) = (.*)/, "$1,$2")
  configs = strTemp.split(',')
  if (configs.length < 6 || configs[1] !== 'vmess') {
    return null;
  }
  ps = configs[0].trim();
  add = configs[2].trim();
  port = configs[3].trim();
  if (port === '0') {
    return null;
  }
  cipher = configs[4].trim();
  id = configs[5].replaceAll("\"", "").trim();
  for (var i=6; i<configs.length; ++i) {
    vArray = configs[i].split('=');
    if (vArray.length < 2) {
      continue;
    }
    itemName = vArray[0].trim();
    itemVal = vArray[1].trim();
    switch(itemName) {
      case 'group':
        group = itemVal;
        break;
      case 'over-tls':
        tls = itemVal === "true" ? "tls" : "";
        break;
      case 'tls-host':
        host = itemVal;
        break;
      case 'obfs-path':
        path = itemVal.replaceAll("\"", "");
        break;
      case 'obfs-header':
        headers = itemVal.replaceAll("\"", "").replaceAll('[Rr][Nn]', '|').split('|');
        for (const x of headers) {
          if (/Host:/i.test(x)) {
            host = x.substr(6);
          } else if (/Edge: /i.test(x)) {
            edge = x.substr(6);
          }
        }
        break;
      case 'obfs':
        if (itemVal === 'ws') {
          net = 'ws';
        }
        break;
      default: continue;
    }
  }
  if (!path) {
    path = '/';
  }
  return {group, ps, add, port, type, id, aid, net, cipher, path, host, edge, tls, sni};
}

function parse(link) {
  let PREFIX = 'vmess://';
  if (!link.startsWith(PREFIX)) {
    PREFIX = 'vmess1://';
    if (!link.startsWith(PREFIX)) {
      throw new Error('Invalid vmess link');
    }
  }
  var version = '', ps = '', add = '', port = '', type = '', id = '', aid = '', net = '', path = '', host = '', tls = '', sni = '', jsondata = {}, vArray = [], group = V2RAY_DEFAULT_GROUP;
  const vmess = atob(link.substr(PREFIX.length));
  if (/(.*?) = (.*)/.test(vmess)) {
    return parseQuan(vmess);
  }
  jsondata = JSON.parse(vmess);
  version = jsondata.v??"1";
  ps = jsondata.ps??ps;
  add = jsondata.add??add;
  port = jsondata.port??port;
  if (port === '0') {
    return null;
  }
  type = jsondata.type??type;
  id = jsondata.id??id;
  aid = jsondata.aid??aid;
  net = jsondata.net??net;
  tls = jsondata.tls??tls;
  host = jsondata.host??host;
  sni = jsondata.sni??sni;
  switch(version) {
    case '1':
      if (host) {
        vArray = host.split(";");
        if (vArray.length === 2) {
          host = vArray[0];
          path = vArray[1];
        }
      }
      break;
    case '2':
      path = jsondata.path??path;
      break;
  }
  add = add.trim();
  return {group, ps, add, port, type, id, aid, net, cipher: "auto", path, host, edge: "", tls, sni}
}

function vmessConstruct(group, remarks, add, port, type, id, aid, net, cipher, path, host, edge, tls, sni, udp, tfo, scv, tls13) {
  const node = commonConstruct(PROXY_TYPE.VMess, group, remarks, add, port, udp, tfo, scv, tls13);
  node.UserId = !id? "00000000-0000-0000-0000-000000000000" : id;
  node.AlterId = Number.parseInt(aid);
  node.EncryptMethod = cipher;
  node.TransferProtocol = !net? "tcp" : net;
  node.Edge = edge;
  node.ServerName = sni;

  if(net == "quic") {
    node.QUICSecure = host;
    node.QUICSecret = path;
  } else {
    node.Host = (!host && !isIPv4(add) && !isIPv6(add))? add: host.trim();
    node.Path = !path? "/": path.trim();
  }
  node.FakeType = type;
  node.TLSSecure = tls === "tls";
  return node;
}

function vmess(link) {
  if (/vmess:\/\/([A-Za-z0-9-_]+)\?(.*)/.test(link)) {
    var parsed = parseShadowRocket(link);
  } else if (/vmess:\/\/(.*?)@(.*)/.test(link)) {
    parsed = parseStdVmess(link);
  } else if (/vmess1:\/\/(.*?)\?(.*)/.test(link)) {
    parsed = parseKitsunebi(link);
  } else {
    parsed = parse(link);
  }
  const {group, ps, add, port, type, id, aid, net, cipher, path, host, edge, tls, sni} = parsed;
  return vmessConstruct(group, ps, add, port, type, id, aid, net, cipher, path, host, edge, tls, sni);
}

exports = module.exports = {
  vmessConstruct,
  vmess,
}