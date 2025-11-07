const { commonConstruct, parseQueryString } = require("../index.js");
const { PROXY_TYPE, SS_DEFAULT_GROUP } = require("../consts.js");

function parse(link) {
  const PREFIX = 'ss://';
  if (!link.startsWith(PREFIX)) {
    throw new Error('Invalid ss link');
  }
  var ps = '', password = '', method = '', server = '', port = '', plugins = '', plugin = '', pluginopts = '', addition = '', group = SS_DEFAULT_GROUP, secret = '';
  var ss = link.substr(PREFIX.length).replaceAll("/?", "?");
  if (ss.indexOf('#') > -1) {
    const splits = ss.split('#');
    ss = splits[0];
    ps = decodeURIComponent(splits[1]);
  }
  if (ss.indexOf('?') > -1) {
    [ss, addition] = ss.split('?');
    const params = parseQueryString(addition);
    plugins = decodeURIComponent(params.plugin);
    [plugin, pluginopts] = plugins.split(';');
    group = params.group? atob(params.group): '';
  }
  if (ss.indexOf('@') > -1) {
    let mat = /(?<secret>\S+?)@(?<server>\S+):(?<port>\d+)/.exec(ss);
    if (!mat) {
      return null;
    }
    ({secret, server, port} = mat.groups);
    mat = /(?<method>\S+?):(?<password>\S+)/.exec(atob(secret));
    if (!mat) {
      return null;
    }
    ({method, password} = mat.groups);
  } else {
    let mat = /(?<method>\S+?):(?<password>\S+)@(?<server>\S+):(?<port>\d+)/.exec(atob(ss));
    if (!mat) {
      return null;
    }
    ({method, password, server, port} = mat.groups);
  }
  if (port === '0') {
    return null;
  }
  if (!ps) {
    ps = `${server}:${port}`;
  }
  return {group, ps, server, port, password, method, plugin, pluginopts};
}

function ssConstruct(group, ps, server, port, password, method, plugin, pluginopts, udp, tfo, scv, tls13) {
  const node = commonConstruct(PROXY_TYPE.Shadowsocks, group, ps, server, port, udp, tfo, scv, tls13);
  node.Password = password;
  node.EncryptMethod = method;
  node.Plugin = plugin;
  node.PluginOption = pluginopts;
  return node;
}

function ss(link) {
  const parsed = parse(link);
  if (!parsed) {
    return null;
  }
  const {group, ps, server, port, password, method, plugin, pluginopts} = parsed;
  return ssConstruct(group, ps, server, port, password, method, plugin, pluginopts);
}

exports = module.exports = {
  ssConstruct,
  ss
}