const SS_DEFAULT_GROUP = "SSProvider"
const SSR_DEFAULT_GROUP = "SSRProvider"
const V2RAY_DEFAULT_GROUP = "V2RayProvider"
const SOCKS_DEFAULT_GROUP = "SocksProvider"
const HTTP_DEFAULT_GROUP = "HTTPProvider"
const TROJAN_DEFAULT_GROUP = "TrojanProvider"
const SNELL_DEFAULT_GROUP = "SnellProvider"

const PROXY_TYPE = {
  Unknow: 'Unknown',
  Shadowsocks: 'SS',
  ShadowsocksR: 'SSR',
  VMess: 'VMess',
  Trojan: 'Trojan',
  Snell: 'Snell',
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  SOCKS5: 'SOCKS5'
}

const ss_ciphers = ["rc4-md5", "aes-128-gcm", "aes-192-gcm", "aes-256-gcm", "aes-128-cfb", "aes-192-cfb", "aes-256-cfb", "aes-128-ctr", "aes-192-ctr", "aes-256-ctr", "camellia-128-cfb", "camellia-192-cfb", "camellia-256-cfb", "bf-cfb", "chacha20-ietf-poly1305", "xchacha20-ietf-poly1305", "salsa20", "chacha20", "chacha20-ietf"];
const ssr_ciphers = ["none", "table", "rc4", "rc4-md5", "aes-128-cfb", "aes-192-cfb", "aes-256-cfb", "aes-128-ctr", "aes-192-ctr", "aes-256-ctr", "bf-cfb", "camellia-128-cfb", "camellia-192-cfb", "camellia-256-cfb", "cast5-cfb", "des-cfb", "idea-cfb", "rc2-cfb", "seed-cfb", "salsa20", "chacha20", "chacha20-ietf"];

exports = module.exports = {
  SS_DEFAULT_GROUP,
  SSR_DEFAULT_GROUP,
  V2RAY_DEFAULT_GROUP,
  SOCKS_DEFAULT_GROUP,
  HTTP_DEFAULT_GROUP,
  TROJAN_DEFAULT_GROUP,
  SNELL_DEFAULT_GROUP,

  PROXY_TYPE,

  ss_ciphers,
  ssr_ciphers,
}