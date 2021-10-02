import ldap from 'ldapjs';
import { LOG } from './util/logger';
import { UserStore } from './user-store';
import { ServerOptions } from 'https';
import { Protocol } from './models';

class ServerConfiguration {
    public ldap?: { port: number, enabled: boolean };
    public ldaps?: { port: number, enabled: boolean, 'key-location': string, 'cert-location': string };
}

export class Server {
    private readonly servers: { ldap?: ldap.Server, ldaps?: ldap.Server };
    private serverConfiguration: ServerConfiguration;
    constructor(private readonly userStore: UserStore) {
        this.servers = {};
        this.serverConfiguration = {};
    }

    public async initiate(configuration: ServerConfiguration) {
        if (configuration.ldap != null && configuration.ldap.enabled === true) {
            this.configureProtocol(Protocol.LDAP, configuration.ldap);
        }
        if (configuration.ldaps != null && configuration.ldaps.enabled === true) {
            this.configureProtocol(Protocol.LDAPS, configuration.ldaps);
        }
        this.serverConfiguration = configuration;
    }

    private configureProtocol(protocol: string, ldapConfiguration: any) {
        let options: ServerOptions = <ServerOptions>{ port: ldapConfiguration.port };
        if (protocol == Protocol.LDAPS) {
            const fs = require('fs');
            options = <ServerOptions>{
                key: fs.readFileSync(ldapConfiguration['key-location']),
                certificate: fs.readFileSync(ldapConfiguration['cert-location'])
            };
        }

        const server: ldap.Server = ldap.createServer(options);
        server.bind(this.userStore.searchBase,
            (req: any, res: any, next: any) => this.bindHandler(req, res, next));
        server.search(this.userStore.searchBase,
            (req: any, res: any, next: any) => this.authenticationHandler(req, res, next),
            (req: any, res: any, next: any) => this.searchHandler(req, res, next)
        );
        this.servers[protocol == Protocol.LDAPS ? Protocol.LDAPS : Protocol.LDAP] = server;
    }

    private authenticationHandler(req: any, res: any, next: any) {
        LOG.info('Initiating Authentication')
        const isSearch = (req instanceof ldap.SearchRequest);
        const dnString = req.connection.ldap.bindDN.toString();
        if (this.userStore.hasSearchPermission(dnString) == false || isSearch == false) {
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

        if (this.userStore.autheticate(dn, password) == false) {
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
        if (req.dn == null) {
            return next(new ldap.NoSuchObjectError("null"));
        }
        if (this.userStore.isValid(req.dn.toString()) == false) {
            return next(new ldap.NoSuchObjectError(req.dn.toString()));
        }

        const results: { "dn": string, attributes: object }[] = this.userStore.find(req.dn, req.scope, req.filter);
        for (const result of results) {
            res.send(result);
        }
        res.end();
        LOG.info('Searching in', this.userStore.searchBase, 'completed');
        return next();
    }

    public async listen() {
        const promises: any[] = []
        for (const protocol in this.serverConfiguration) {
            if (this.servers[<Protocol>protocol] == null) {
                continue;
            }
            const config = this.serverConfiguration[<Protocol>protocol];
            if (config == null) { continue; }
            LOG.info(`Try listening to port [${config.port}]`)
            const promise: Promise<void> = new Promise((resolve, reject): void => {
                /// no need to handle the error path. If listenning failed the application should exit
                (<ldap.Server>this.servers[<Protocol>protocol]).listen(config.port, () => {
                    LOG.info('LDAP server up at: %s', (<ldap.Server>this.servers[<Protocol>protocol]).url);
                    resolve();
                });
            });
            promises.push(promise);
        }
        return Promise.all(promises);
    }
}