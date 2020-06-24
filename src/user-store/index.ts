import ldap from 'ldapjs';
import { LOG } from '../util/logger';

export class UserStore {

    private readonly store: Map<string, any> = new Map<string, any>();
    private readonly usersWithSearchPermission: string[] = []

    public async initiate() {
    }

    private getObject(dn: string): any {
        return this.store.get(dn);
    }

    public find(dn: any, scope: string, filter: any): { dn: string; attributes: object; }[] {
        switch (scope) {
            case 'base':
                // matches the requested DN only
                return this.findEntryOnBaseLevelScope(dn, filter);
            case 'one':
                return this.findEntriesOnOneLevelScope(dn, filter);
            case 'sub':
                return this.findEntriesOnSubTreeLevelScope(dn, filter);
            default:
        }
        return [];
    }

    private getAllUserDNs(): string[] {
        return Array.from(this.store.keys());
    }

    private findEntryOnBaseLevelScope(dn: any, filter: any): { dn: string; attributes: object; }[] {
        const results = [];
        const obj = this.getObject(dn);
        if (filter.matches(obj)) {
            results.push({
                dn: dn,
                attributes: obj
            });
        }
        return results;
    }

    private findEntriesOnOneLevelScope(dn: any, filter: any): { dn: string; attributes: object; }[] {
        const results: { dn: string; attributes: object; }[] = [];
        for (const userDN of this.getAllUserDNs()) {
            const parent = ldap.parseDN(userDN).parent();
            if (dn.equals(userDN) == false && (parent == null || parent.equals(dn) == false)) { continue; }
            const obj = this.getObject(dn);
            try {
                if (filter.matches(obj)) {
                    results.push({
                        dn: userDN,
                        attributes: obj
                    });
                }
            } catch (error) {
                LOG.log('Filter unmached for key', userDN);
            }
        }
        return results;
    }

    private findEntriesOnSubTreeLevelScope(dn: any, filter: any): { dn: string; attributes: object; }[] {
        const results: { dn: string; attributes: object; }[] = [];
        for (const userDN of this.getAllUserDNs()) {
            if (dn.equals(userDN) == false && dn.parentOf(userDN) == false) { continue; }
            const obj = this.getObject(dn);
            try {
                if (filter.matches(obj)) {
                    results.push({
                        dn: userDN,
                        attributes: obj
                    });
                }
            } catch (error) {
                LOG.log('Filter unmached for key', userDN);
            }
        }
        return results;
    }

    public isValid(dn: any): boolean {
        throw new Error("Method not implemented.");
    }

    public autheticate(dn: string, password: string): boolean {
        throw new Error("Method not implemented.");
    }

    public get searchBase() {
        return "";
    }

    public hasSearchPermission(bindDN: string): boolean {
        throw new Error("Method not implemented.");
    }

}