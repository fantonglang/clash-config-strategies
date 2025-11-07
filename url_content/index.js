const { getLinks } = require('./utils/request.js');
const { add_proxy_from_node, link2node } = require('./utils/protocols/index.js');
const YAML = require('yaml');
const https = require('https')

async function get_yaml_content(file_path) {
  if (!file_path.startsWith('https://functions.my-docs.org/sub-to-clash-proxies')) {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const resp = await fetch(file_path, {
      agent
    })
    if (!resp.ok) {
      return null
    }
    return await resp.text()
  }
  let url = new URL(file_path);
  url = url.searchParams.get('url');
  const links = await getLinks(url);
  const proxies = [];
  for (const link of links) {
    const node = link2node(link);
    node && add_proxy_from_node(node, proxies);
  }
  const base = {
    proxies
  }
  return YAML.stringify(base);
}

exports = module.exports = {
  get_yaml_content,
}