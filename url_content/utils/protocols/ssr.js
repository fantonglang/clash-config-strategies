const { commonConstruct, parseQueryString } = require("../index.js");
const { PROXY_TYPE, SSR_DEFAULT_GROUP, ss_ciphers } = require("../consts.js");
const { ssConstruct } = require("./ss.js");

function parse(link) {
  const PREFIX = 'ssr://';
  if (!link.startsWith(PREFIX)) {
    throw new Error('Invalid ssr link');
  }
  var strobfs = '', remarks = '', group = '', server = '', port = '', method = '', password = '', protocol = '', protoparam = '', obfs = '', obfsparam = '';
  var ssr = link.substr(PREFIX.length).replaceAll("\r", "");
  ssr = atob(ssr);
  if (ssr.indexOf('/?') > -1) {
    [ssr, strobfs] = ssr.split('/?');
    const params = parseQueryString(strobfs);
    group = atob(params.group);
    remarks = atob(params.remarks);
    obfsparam = atob(params.obfsparam).replace(/\s/g, '');
    protoparam = atob(params.protoparam).replace(/\s/g, '');
  }
  let mat = /(?<server>\S+):(?<port>\d+?):(?<protocol>\S+?):(?<method>\S+?):(?<obfs>\S+?):(?<password>\S+)/.exec(ssr);
  if (!mat) {
    return null;
  }
  ({server, port, protocol, method, obfs, password} = mat.groups); 
  password = atob(password);
  if (port === '0') {
    return null;
  }
  if (!group) {
    group = SSR_DEFAULT_GROUP
  }
  if (!remarks) {
    remarks = `${server}:${port}`;
  }
  if (ss_ciphers.indexOf(method) > -1 && (!obfs || obfs === 'plain') && (!protocol || protocol === 'origin')) {
    return {
      type: 'ss',
      data: {group, remarks, server, port, password, method}
    };
  } else {
    return {
      type: 'ssr',
      data: {group, remarks, server, port, protocol, method, obfs, password, obfsparam, protoparam}
    };
  }
}

function ssrConstruct(group, remarks, server, port, protocol, method, obfs, password, obfsparam, protoparam, udp, tfo, scv) {
  const node = commonConstruct(PROXY_TYPE.ShadowsocksR, group, remarks, server, port, udp, tfo, scv);
  node.Password = password;
  node.EncryptMethod = method;
  node.Protocol = protocol;
  node.ProtocolParam = protoparam;
  node.OBFS = obfs;
  node.OBFSParam = obfsparam;
  return node;
}

function ssr(link) {
  const parsed = parse(link);
  if (!parsed) {
    return null;
  }
  const {type, data} = parse(link);
  if (type === 'ss') {
    const {group, remarks, server, port, password, method} = data;
    return ssConstruct(group, remarks, server, port, password, method, '', '');
  } else if (type === 'ssr') {
    const {group, remarks, server, port, protocol, method, obfs, password, obfsparam, protoparam} = data;
    return ssrConstruct(group, remarks, server, port, protocol, method, obfs, password, obfsparam, protoparam);
  } else {
    return null;
  }
}

exports = module.exports = {
  ssrConstruct,
  ssr
}