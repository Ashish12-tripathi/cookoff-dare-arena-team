const crypto = require('crypto');
module.exports = () => crypto.randomBytes(6).toString('hex');
