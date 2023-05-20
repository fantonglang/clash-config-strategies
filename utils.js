const fs = require('fs/promises')
const fs_sync = require('fs')
const https = require('https')
const fetch = require('cross-fetch')
const YAML = require('yaml')
const get_tags = require('./tags')
const S3 = require('aws-sdk/clients/s3.js')
var mime = require('mime-types')

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
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    const resp = await fetch(file_path, {
      agent
    })
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
  const tags = get_tags(proxy, prefix)
  return {name: json.name, tags, proxy: json}
}



function upload2r2(local_path, key) {
  const s3 = new S3({
    endpoint: `https://${process.env.r2_account_id}.r2.cloudflarestorage.com`,
    accessKeyId: `${process.env.r2_access_key_id}`,
    secretAccessKey: `${process.env.r2_secret_access_key}`,
    signatureVersion: 'v4',
  });
  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: process.env.r2_bucket,
      Key: key,
      Body: fs_sync.createReadStream(local_path),
      ContentType: mime.lookup(local_path)
    }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.Location)
      }
    })
  })
}


exports = module.exports = {
  get_sources_content,
  combine_prefix_in_proxy,
  get_template_json,
  upload2r2
}

