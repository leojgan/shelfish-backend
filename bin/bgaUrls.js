const config = require('../config');

// standard construction of URI:
// apiRoot + apiIds + string of comma-separated gameIds + string of comma-separated fields + clientId
const apiRoot = 'https://api.boardgameatlas.com/api/search?ids=';
const fields = '&fields=';
const clientId = config.bgaClientId;

module.exports = apiRoot;
module.exports = fields;
module.exports = clientId;