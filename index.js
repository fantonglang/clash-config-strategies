const fs = require('fs/promises');
const entry = require('./general_purpose.js');
require('dotenv').config();

(async function() {
  const {yaml} = await entry([
    {file_path: process.env.juzi_sub, type: 'url', prefix: 'juzi'}, 
    {file_path: process.env.jms_sub, type: 'url', prefix: 'jms'},
    {file_path: process.env.cyanmori_sub, type: 'url', prefix: 'cyanmori'},
  ])
  await fs.writeFile(process.env.target_path, yaml)
  console.log('OK')
})()