const config = process.env.NODE_ENV === 'production' ? process.env : require('./secrets');

module.exports = config;
