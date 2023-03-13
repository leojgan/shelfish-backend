const config = require('../config');

// standard construction of URI:
// apiRoot + apiIds + string of comma-separated gameIds + string of comma-separated fields + clientId
module.exports = {
    'apiRoot': 'https://api.boardgameatlas.com/api/search?ids=',
    'fields': '&fields=',
    'clientId': config.bgaClientId,
}