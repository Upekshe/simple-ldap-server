import ldap from 'ldapjs';
import config from 'config';
import { UserStore } from './user-store';
import { LOG } from './util/logger';

export class Server {
    private readonly server: ldap.Server;
    constructor(private readonly userStore: UserStore) {
        this.server = ldap.createServer(this.getServerOptions());
    }

    public async initiate() {
        this.server.bind(this.userStore.searchBase,
            (req: any, res: any, next: any) => this.bindHandler(req, res, next));
        this.server.search(this.userStore.searchBase,
            (req: any, res: any, next: any) => this.authenticationHandler(req, res, next),
            (req: any, res: any, next: any) => this.searchHandler(req, res, next)
        );
    }

    private authenticationHandler(req: any, res: any, next: any) {
        LOG.info('Initiating Authentication')
        const isSearch = (req instanceof ldap.SearchRequest);
        if (!(this.userStore.hasSearchPermission(req.connection.ldap.bindDN)) || !isSearch) {
            LOG.error('Binded DN is not permitted to search');
            return next(new ldap.InsufficientAccessRightsError());
        }
        LOG.info('Authentication completed')
        return next();
    }

    private bindHandler(req: any, res: any, next: any) {
        if (req.dn == null) {
            LOG.error('Requested DN is empty');
            return next(new ldap.InvalidCredentialsError());
        }
        if (!req.dn.childOf(this.userStore.searchBase)) {
            LOG.error('Requested Bind DN is not a child of search DN');
            LOG.info('Binding failed');
            return next(new ldap.InvalidCredentialsError());
        }

        const dn: string = req.dn.format({ upperName: true, skipSpace: true }).toString();
        const password: string = req.credentials;

        if (this.userStore.autheticate(dn, password) == true) {
            LOG.error('Invalid credentials');
            LOG.info('Binding of', dn, 'failed');
            return next(new ldap.InvalidCredentialsError());
        }

        LOG.info('Binding of', dn, 'successful');
        res.end();
        return next();
    }

    private searchHandler(req: any, res: any, next: any) {
        LOG.info('Initiating search');
        if (this.userStore.isValid(req.dn) == false) {
            return next(new ldap.NoSuchObjectError(req.dn.toString()));
        }

        const results: { "dn": string, attributes: object }[] = this.userStore.find(req.dn, req.scope, req.filter);
        for (const result of results) {
            res.send(result);
        }
        res.end();
        console.log('Searching in', this.userStore.searchBase, 'completed');
        return next();
    }

    public async listen() {
        return new Promise((resolve, reject) => {
            /// no need to handle the error path. If listenning failed the application should exit
            this.server.listen(config.get('server.port'), '127.0.0.1', () => {
                LOG.info('LDAP server up at: %s', this.server.url);
                resolve();
            });

        })
    }

    private getServerOptions(): ldap.ServerOptions {
        return {};
    }
}