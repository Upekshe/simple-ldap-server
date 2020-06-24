import { UserStore } from "./user-store";
import { Server } from "./server";
import { LOG } from "./util/logger";

const store = new UserStore();
const server = new Server(store);
store
    .initiate().then(() => {
        return server.initiate();
    }).then(() => {
        return server.listen();
    }).then(() => {
        LOG.info('LDAP Service initiation complete');
    }).catch((exception) => {
        LOG.error('LDAP Service initiation failed. Self destructing', exception);
        process.exit(0);
    })