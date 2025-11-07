function parseQueryString(str) {
  if (str.startsWith('?')) {
    str = str.substring(1)
  }
  const pairs = str.split('&').filter(x => x)
  const result = {}
  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    result[key] = value
  }
  return result
}

function empty(val) {
  return val === undefined || val === null || val === ''
}

function commonConstruct(type, group, remarks, server, port, udp, tfo, scv, tls13) {
  const node = {
    Type: type,
    Group: group,
    Remark: remarks,
    Hostname: server,
    Port: Number.parseInt(port)
  }
  if (!empty(udp)) {
    node.UDP = udp
  }
  if (!empty(tfo)) {
    node.TCPFastOpen = tfo
  }
  if (!empty(scv)) {
    node.AllowInsecure = scv
  }
  if (!empty(tls13)) {
    node.TLS13 = tls13
  }
  return node
}

function isIPv4(address) {
  // Split the address into an array of octets
  var octets = address.split('.');

  // Check if the address has exactly 4 octets
  if (octets.length !== 4) {
    return false;
  }

  // Iterate over each octet
  for (var i = 0; i < octets.length; i++) {
    var octet = octets[i];

    // Check if the octet is a valid number between 0 and 255
    if (!/^\d+$/.test(octet) || octet < 0 || octet > 255) {
      return false;
    }
  }

  return true;
}

function isIPv6(address) {
  var blocks = address.split(':');

  // Check if the address has exactly 8 blocks
  if (blocks.length !== 8) {
    return false;
  }

  // Check each block for validity
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];

    // Check if the block is empty
    if (block === '') {
      // Check if the empty block is the last block
      if (i !== blocks.length - 1) {
        return false;
      }
    } else {
      // Check if the block is a valid hexadecimal number
      if (!/^[0-9A-Fa-f]{1,4}$/.test(block)) {
        return false;
      }
    }
  }

  return true;
}

function maybe_bool(val) {
  if (!val) {
    return null;
  }
  if (val.toLowerCase() === 'true') {
    return true
  } else if (val.toLowerCase() === 'false') {
    return false
  } else {
    return null;
  }
}

function make_remark_unique(remark, proxies) {
  if (proxies.some(p => p.name === remark)) {
    let i = 2;
    while (proxies.some(p => p.name === `${remark} ${i}`)) {
      i++;
    }
    return `${remark} ${i}`;
  }
  return remark;
}

exports = module.exports = {
  parseQueryString,
  commonConstruct,
  isIPv4,
  isIPv6,
  maybe_bool,
  make_remark_unique,
}