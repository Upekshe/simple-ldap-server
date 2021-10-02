import { UserStore } from "./user-store";
import { Server } from "./server";
import { LOG } from "./util/logger";
import config from 'config';

const store = new UserStore();
const server = new Server(store);
store
    .initiate().then(() => {
        LOG.info(">>>>>>> Banti booting up")
        return server.initiate(config.get('protocols'));
    }).then(() => {
        return server.listen();
    }).then(() => {
        LOG.info('LDAP Service initiation complete');
        LOG.info('=============================================')
        LOG.info(`   _______  _______  __    _  _______  ___ `)
        LOG.info(`  |  _    ||   _   ||  |  | ||       ||   |`) 
        LOG.info(`  | |_|   ||  |_|  ||   |_| ||_     _||   |`) 
        LOG.info(`  |       ||       ||       |  |   |  |   |`) 
        LOG.info(`  |  _   | |       ||  _    |  |   |  |   |`) 
        LOG.info(`  | |_|   ||   _   || | |   |  |   |  |   |`) 
        LOG.info(`  |_______||__| |__||_|  |__|  |___|  |___|`) 
        LOG.info('')
        LOG.info('=============================================')
    }).catch((exception) => {
        LOG.error('LDAP Service initiation failed. Self destructing', exception);
        process.exit(0);
    })