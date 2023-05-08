const fs = require('fs/promises')
const YAML = require('yaml')

async function get_template_json(file_name = 'template') {
  const _path = `./${file_name}.yaml`
  const buffer = await fs.readFile(_path)
  return YAML.parse(buffer.toString())
}

async function parse_content({file_path, type, prefix}) {
  if (type === 'path') {
    const buffer = await fs.readFile(file_path)
    return {content: buffer.toString(), prefix}
  } else if (type === 'url') {
    const resp = await fetch(file_path)
    if (!resp.ok) {
      return null
    }
    const text = await resp.text()
    return {content: text, prefix}
  }
  return null
}

async function* get_sources_content(sources) {
  for (const source of sources) {
    const content = await parse_content(source)
    if (!content) {
      continue
    }
    yield content
  }
}

function combine_prefix_in_proxy(proxy, prefix) {
  const json = proxy
  json.name = `${prefix}-${json.name}`
  return {name: json.name, proxy: json}
}

exports = module.exports = {
  get_sources_content,
  combine_prefix_in_proxy,
  get_template_json
}

