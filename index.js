const fs = require('fs/promises');
const entry = require('./general_purpose.js');
require('dotenv').config();
const fetch = require('cross-fetch');

(async function() {
  const {yaml, metadata} = await entry([
    {file_path: process.env.juzi_sub, type: 'url', prefix: 'juzi'}, 
    {file_path: process.env.jms_sub, type: 'url', prefix: 'jms'},
    {file_path: process.env.cyanmori_sub, type: 'url', prefix: 'cyanmori'},
  ])
  await fs.writeFile(process.env.target_path, yaml)
  const resp = await fetch('http://localhost:9090/configs?force=false', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      path: process.env.target_path
    })
  })
  console.log(resp.ok? 'ok': 'failed')
})()