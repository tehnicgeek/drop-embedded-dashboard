//Logger 
var winston = require('winston');

var winston = new (winston.Logger)({  

    transports: [
        new winston.transports.Console({ level: 'debug' }),
        //File name set to logFile.log
        //new winston.transports.File({ filename:'./logFile.log', level: 'debug' })
    ]
});

winston.info('LORA Network Server - the logs are being captured in logFile')

module.exports = winston;  

//End of the file