const fs = require('fs/promises');
const entry = require('./general_purpose.js');
const { upload2r2 } = require('./utils.js');
require('dotenv').config();

(async function() {
  const {yaml, yaml2} = await entry([
    {file_path: process.env.juzi_sub, type: 'url', prefix: 'juzi'}, 
    {file_path: process.env.jms_sub, type: 'url', prefix: 'jms'},
    {file_path: process.env.cyanmori_sub, type: 'url', prefix: 'cyanmori'},
  ])
  await fs.writeFile(process.env.target_path, yaml)
  await fs.writeFile('./final.yaml', yaml2)
  await upload2r2('./final.yaml', 'final.yaml')
  await fs.rm('./final.yaml', {force: true})
  console.log('OK')
})()