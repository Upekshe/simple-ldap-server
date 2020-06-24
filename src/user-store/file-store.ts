import { DataProvider } from "./abstract-data-provider";
import ldap from 'ldapjs'
import { LOG } from "../util/logger";

export class UserFileStore extends DataProvider {
    private readonly store: Map<string, any> = new Map<string, any>();
    private userOuDN: string = "";
    private hiddenAttributes = ['password', 'permissions']
    public constructor() {
        super();
    }

    public get(dn: string) {
        return this.store.get(dn);
    }

    public getAllUserDNs(): string[] {
        return Array.from(this.store.keys());
    }

    public getSearchBaseDN(): string {
        return this.userOuDN;
    }

    public pack(obj: any): any {
        if (obj == null) { return null; }
        const clone = { ...obj };
        for (const attr of this.hiddenAttributes) {
            clone[attr] = undefined;
        }
        return clone;
    }

    public async load(config: any): Promise<any> {
        const json = require(config.location);
        const root = config['root-entry'];
        const userGroupOu = config['user-group-ou'];
        const defaultPassword = config['common-password'];
        const mapping = config['attribute-mapping'];
        const users = json[config['users-array-name']];
        const optionalData = config['optional'];
        this.userOuDN = `${userGroupOu},${root}`;

        // adding entries to the map
        this.add(root, {});
        this.add(this.userOuDN, { objectClass: 'group' });
        const defaults = { password: defaultPassword }
        for (const user of users) {
            const mappedUser: any = this.getMappedInternalDataObj(user, mapping, defaults);
            const cn: string = mappedUser['cn'];
            const parsedDN = this.getUserDnString(cn, this.userOuDN);
            this.add(parsedDN, mappedUser);
        }
        if (optionalData == null) { return this.getUserCount(); }
        if (optionalData['search-permitted-users'] == null) { return this.getUserCount(); }
        const searchPermittedUsers = optionalData['search-permitted-users'];
        // adding optional search permitted users
        for (const sUser of searchPermittedUsers) {
            if (sUser.dn == null) { continue; }
            const data = { objectClass: 'user', permissions: ['search'], password: sUser.password == null ? defaultPassword : sUser.password };
            this.add(sUser.dn, data);
        }
        return this.getUserCount();
    }

    public getUserCount(): number {
        return this.store.size;
    }

    private getMappedInternalDataObj(obj: any, mapping: any = {}, defaults: any = {}): object {
        if (obj == null) { return {} }
        const returnObj: any = new Object();
        for (const key in mapping) {
            returnObj[key] = this.getValueForMapping(obj, mapping[key]);
        }
        for (const key in defaults) {
            if (returnObj[key] != null) { continue; }
            returnObj[key] = defaults[key];
        }
        return returnObj
    }

    private getValueForMapping(obj: any, value: string): any {
        if (value == null) { return null; }
        if (value.startsWith('obj.')) {
            const key = value.substring(4);
            const objValue = obj[key];
            if (objValue == null) { return null; }
            return objValue;
        }
        return value;
    }

    private add(dn: string, data: any) {
        this.store.set(this.getParsedDnString(dn), data);
        LOG.info('Added', dn);
    }

    private getParsedDnString(dn: string): string {
        const dnObj = ldap.parseDN(dn);
        return dnObj.format({ upperName: true, skipSpace: true }).toString();
    };

    private getUserDnString(id: string, userbase: string): string {
        return this.getParsedDnString(`cn=${id},${userbase}`);
    };
}