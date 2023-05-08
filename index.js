const fs = require('fs/promises')
const entry = require('./general_purpose.js');

(async function() {
  const {yaml, metadata} = await entry([
    {file_path: '/Users/sunzhao/.config/clash/桔子云.yaml', type: 'path', prefix: 'juzi'}, 
    {file_path: '/Users/sunzhao/.config/clash/config.yaml', type: 'path', prefix: 'jms'}]
  )
  await fs.writeFile('final.yaml', yaml)
})()