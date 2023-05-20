require('dotenv').config();
const {upload2r2} = require('./utils');


upload2r2('./final.yaml', 'a.yaml')