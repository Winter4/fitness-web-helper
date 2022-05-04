const { createLogger, transports, format } = require('winston');

module.exports.log = createLogger({
	format: format.combine(
		format.timestamp(),
		format.json(),
	),
 	transports: [
 		new transports.Console(),
    	new transports.File({ filename: './logs/full.log' }),
    	new transports.File({ filename: './logs/error.log', level: 'error' }),
	]
});