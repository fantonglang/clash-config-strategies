const {get_template_json, get_sources_content, combine_prefix_in_proxy} = require('./utils.js')
const YAML = require('yaml')

async function entry(sources) {
  const base = await get_template_json()
  const proxy_collection = []
  for await (const {content, prefix} of get_sources_content(sources)) {
    const json = YAML.parse(content)
    const {proxies} = json
    for (const _proxy of proxies) {
      const {name, proxy} = combine_prefix_in_proxy(_proxy, prefix)
      proxy_collection.push({name, proxy, prefix})
    }
  }
  base.proxies = proxy_collection.map(p => p.proxy)
  //proxy_groups
  const proxy_groups = []
  base['proxy-groups'] = proxy_groups
  proxy_groups.push({
    name: 'Proxy',
    type: 'select',
    proxies: sources.map(p => `Proxy-${p.prefix}`)
  })
  for (const {prefix} of sources) {
    proxy_groups.push({
      name: `Proxy-${prefix}`,
      type: 'url-test',
      proxies: proxy_collection.filter(p => p.prefix === prefix).map(p => p.name),
      tolerance: 200,
      lazy: true,
      url: 'http://www.gstatic.com/generate_204',
      interval: 600,
    })  
  }
  proxy_groups.push({
    name: 'Domestic',
    type: 'select',
    proxies: ['DIRECT', 'Proxy']
  })
  proxy_groups.push({
    name: 'AsianTV',
    type: 'select',
    proxies: ['DIRECT', 'Proxy']
  })
  proxy_groups.push({
    name: 'GlobalTV',
    type: 'select',
    proxies: ['DIRECT', 'Proxy']
  })
  proxy_groups.push({
    name: 'Others',
    type: 'select',
    proxies: ['DIRECT', 'Proxy']
  })
  
  return {
    yaml: YAML.stringify(base),
    metadata: proxy_collection
  }
}

exports = module.exports = entry