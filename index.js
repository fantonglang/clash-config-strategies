const fs = require('fs/promises');
const entry = require('./general_purpose.js');
require('dotenv').config();
const fetch = require('cross-fetch');
const test_openai = require('./post-processing');

(async function() {
  const {yaml, final_config} = await entry([
    {file_path: process.env.juzi_sub, type: 'url', prefix: 'juzi'}, 
    {file_path: process.env.jms_sub, type: 'url', prefix: 'jms'},
    {file_path: process.env.cyanmori_sub, type: 'url', prefix: 'cyanmori'},
  ])
  // await fs.writeFile(process.env.target_path, yaml)
  const selects = final_config.proxies.filter(p => ['ss', 'ssr'].indexOf(p.type) >=0).filter(p => p.name != 'vps')
  const results = {}
  // let i = 1
  for (const selected of selects) {
    // console.log(`started: ${i++}`)
    const result = await test_openai(selected)
    results[selected.name] = {
      ok: result, 
      type: selected.type
    }
  }
  
  await fs.writeFile('./temp/results.json', JSON.stringify(results, null, 2))
})()