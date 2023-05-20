const {get_template_json, get_sources_content, combine_prefix_in_proxy} = require('./utils.js')
const YAML = require('yaml')
const fs = require('fs')
const test_openai = require('./post-processing');

function get_places(grouped_by_tags) {
  return Object.keys(grouped_by_tags).filter(p => p.startsWith('PLACE-'))
}

async function entry(sources) {
  const base = await get_template_json()
  const proxy_collection = []
  const grouped_by_tags = {}
  for await (const {content, prefix} of get_sources_content(sources)) {
    const json = YAML.parse(content)
    const {proxies} = json
    for (const _proxy of proxies) {
      const {name, tags, proxy} = combine_prefix_in_proxy(_proxy, prefix)
      proxy_collection.push({name, tags, prefix, proxy})
      for (const tag of tags) {
        if (grouped_by_tags[tag]) {
          grouped_by_tags[tag].push({name, prefix, proxy})
        } else {
          grouped_by_tags[tag] = [{name, prefix, proxy}]
        }
      }
    }
  }
  base.proxies = [
    ...proxy_collection.map(p => p.proxy),
    {name: 'vps', server: process.env.vps_server, port: Number.parseInt(process.env.vps_port), type: process.env.vps_type, cipher: process.env.vps_cipher, password: process.env.vps_password}
  ]
  //proxy_groups
  const proxy_groups = []
  base['proxy-groups'] = proxy_groups
  proxy_groups.push({
    name: 'PROXY',
    type: 'select',
    proxies: [
      'CRAWLER', 'GAME', 'OPENAI', 'SAFE',
      ...get_places(grouped_by_tags).map(p => p.replace('PLACE-', '🇺🇳')),
      ...sources.map(p => `SOURCE-${p.prefix}`)
    ]
  })
  proxy_groups.push({
    name: 'CRAWLER',
    type: 'load-balance',
    strategy: 'consistent-hashing',
    proxies: grouped_by_tags['cyanmori-V1'].map(p => p.name),
    url: 'http://www.gstatic.com/generate_204',
    interval: 600
  })
  proxy_groups.push({
    name: 'GAME',
    type: 'select',
    proxies: grouped_by_tags['cyanmori-V2'].map(p => p.name)
  })
  proxy_groups.push({
    name: 'OPENAI',
    type: 'select',
    proxies: grouped_by_tags['openai'].map(p => p.name)
  })
  proxy_groups.push({
    name: 'ALL-LOAD-BALANCE',
    type: 'load-balance',
    strategy: 'consistent-hashing',
    proxies: proxy_collection.filter(p => p.prefix != 'FREE').map(p => p.name),
    url: 'http://www.gstatic.com/generate_204',
    interval: 600
  })
  proxy_groups.push({
    name: 'SAFE',
    type: 'relay',
    proxies: ['ALL-LOAD-BALANCE', 'vps']
  })
  for (const tag of get_places(grouped_by_tags)) {
    proxy_groups.push({
      name: tag.replace('PLACE-', '🇺🇳'),
      type: 'url-test',
      proxies: grouped_by_tags[tag].map(p => p.name),
      url: 'http://www.gstatic.com/generate_204',
      interval: 600,
      tolerance: 50,
      lazy: true
    })
  }
  for (const {prefix} of sources) {
    if (prefix == 'FREE') {
      proxy_groups.push({
        name: `SOURCE-${prefix}`,
        type: 'url-test',
        proxies: proxy_collection.filter(p => p.prefix === prefix).map(p => p.name),
        url: 'http://www.gstatic.com/generate_204',
        interval: 600,
        tolerance: 50,
        lazy: true
      })
      continue
    }
    proxy_groups.push({
      name: `SOURCE-${prefix}`,
      type: 'select',
      proxies: proxy_collection.filter(p => p.prefix === prefix).map(p => p.name)
    })
  }
  proxy_groups.push({
    name: 'OTHERS',
    type: 'select',
    proxies: ['DIRECT', 'PROXY']
  })

  proxy_groups.find(p => p.name === 'OPENAI').proxies = await get_all_openai_ok_names(base)

  const {rules} = YAML.parse(fs.readFileSync('./rules_alt.yaml').toString())
  const alt = {...base}
  delete alt['rule-providers']
  alt.rules = rules
  
  return {
    yaml: YAML.stringify(base),
    yaml2: YAML.stringify(alt)
  }
}

async function get_all_openai_ok_names(final_config) {
  const selects = final_config.proxies.filter(p => ['ss', 'vmess'].indexOf(p.type) >=0).filter(p => p.name != 'vps')
  const results = []
  console.log('====Testing ChatGpt Starts====')
  for (const selected of selects) {
    const result = await test_openai(selected)
    if (result) {
      results.push(selected.name)
    }
  }
  console.log('====Testing ChatGpt Ends====')
  results.sort()
  return results
}

exports = module.exports = entry