const fs = require('fs/promises')
const fs_sync = require('fs')
const https = require('https')
const fetch = require('cross-fetch')
const YAML = require('yaml')
const get_tags = require('./tags')
const S3 = require('aws-sdk/clients/s3.js')
var mime = require('mime-types')
const { get_yaml_content } = require('./url_content/index.js');
const qiniu = require('qiniu');

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
    const text = await get_yaml_content(file_path)
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

// function _upload2r2(local_path, key) {
//   const s3 = new S3({
//     endpoint: `https://${process.env.r2_account_id}.r2.cloudflarestorage.com`,
//     accessKeyId: `${process.env.r2_access_key_id}`,
//     secretAccessKey: `${process.env.r2_secret_access_key}`,
//     signatureVersion: 'v4',
//   });
//   return new Promise((resolve, reject) => {
//     s3.upload({
//       Bucket: process.env.r2_bucket,
//       Key: key,
//       Body: fs_sync.createReadStream(local_path),
//       ContentType: mime.lookup(local_path)
//     }, (err, data) => {
//       if (err) {
//         reject(err)
//       } else {
//         resolve(data.Location)
//       }
//     })
//   })
// }

async function upload2r2(local_path, key) {
  await _upload2r2(local_path, key)
  const url = "http://amghokl.cn/final.yaml"
  await _refresh_qiniu_cdn([url])
}

function _upload2r2(local_path, key) {
  const s3 = new S3({
    endpoint: `https://s3.cn-east-1.qiniucs.com`,
    accessKeyId: `${process.env.qiniu_access_key}`,
    secretAccessKey: `${process.env.qiniu_secret_key}`,
    signatureVersion: 'v4',
  });
  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: process.env.qiniu_bucket,
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

function _refresh_qiniu_cdn(urls) {
  const accessKey = process.env.qiniu_access_key;
  const secretKey = process.env.qiniu_secret_key;
  var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  var cdnManager = new qiniu.cdn.CdnManager(mac);
  return new Promise((resolve, reject) => {
    cdnManager.refreshUrls(urls, function(err, respBody, respInfo) {
      if (err) {
        reject(err);
      } else {
        resolve(respBody);
      }
    });
  });
}


exports = module.exports = {
  get_sources_content,
  combine_prefix_in_proxy,
  get_template_json,
  upload2r2
}

