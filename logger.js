const { createLogger, transports, format } = require('winston');
require('winston-daily-rotate-file');

const full = new transports.DailyRotateFile({
	filename: './logs/bot-full_%DATE%.log',

	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '21d'
});

const error = new transports.DailyRotateFile({
	filename: './logs/bot-error_%DATE%.log',
	level: 'error',

	datePattern: 'YYYY-MM-DD',
	zippedArchive: true,
	maxSize: '150m',
	maxFiles: '21d'
});

module.exports.log = createLogger({
	format: format.combine(
		format.timestamp(),
		format.json(),
	),
 	transports: [
 		full,
 		error,
	]
});