const fs = require('fs')
const {v4: uuidv4} = require('uuid')
const { exec } = require('node:child_process')
const fetch = require('cross-fetch')
const {HttpsProxyAgent} = require('https-proxy-agent')
const AbortController = require('abort-controller')

const config_dir = './temp'

function store_config(json) {
  if (!fs.existsSync(config_dir)) {
    fs.mkdirSync(config_dir)
  }
  const file_path = `${config_dir}/${uuidv4()}.json` 
  fs.writeFileSync(file_path, JSON.stringify(json, null, 2))
  return file_path
}

function wait4(s) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, s*1000)
  })
}

function wait_process_close(ps) {
  return new Promise(resolve => {
    ps.on('close', () => {
      resolve()
    })
  })
}

function start_xray(config_path) {
  const ps = exec(`xray run -c ${config_path}`)
  return new Promise(resolve => {
    ps.stdout.on('data', function(data) {
      if (data.indexOf('Xray') >= 0 && data.indexOf('started') >= 0) {
        resolve(ps)
      }
    })
  })
}

async function test_xray(config_path, name) {
  const ps = await start_xray(config_path)
  const proxy = 'http://127.0.0.1:8001'
  const agent = new HttpsProxyAgent(proxy)
  const controller = new AbortController()
  const { signal } = controller
  const timeout_id = setTimeout(() => controller.abort(), 2000)
  try {
    const resp = await fetch('https://chat.openai.com/', {
      signal,
      agent
    })
    clearTimeout(timeout_id)
    const text = await resp.text()
    if (text.indexOf('Sorry, you have been blocked') >= 0) {
      return false
    }
    return true
  } catch {
    return false
  } finally {
    ps.kill()
    await wait_process_close(ps)
    fs.rmSync(config_path)
  }
}

exports = module.exports = {
  store_config,
  test_xray
}