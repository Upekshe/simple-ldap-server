const log4js = require("log4js");
log4js.configure({
    appenders: {
        console: {
            type: 'stdout', layout: {
                type: 'pattern',
                pattern: '%d [%p] %c - %[%m%]'
            }
        },
        file: {
            type: "file", filename: "logs/simple-ldap-server.log",
            layout: {
                type: 'pattern',
                pattern: '%d [%p] %c - %m'
            }, maxLogSize: 10485760, backups: 5, compress: true
        }
    },
    categories: { default: { appenders: ["console", "file"], level: "debug" } }
});
const logger = log4js.getLogger();
export const LOG = logger;