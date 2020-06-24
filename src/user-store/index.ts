import ldap from 'ldapjs';
import config from 'config';
import { LOG } from '../util/logger';
import { DataProvider } from './abstract-data-provider';
import { UserFileStore } from './file-store';
import { StructureFileStore } from './structure-file-store';
import { PerfStore } from './perf-store';

export class UserStore {
    private readonly modes: Map<string, typeof DataProvider> = new Map<string, typeof DataProvider>();
    private readonly usersWithSearchPermission: string[] = []
    private readonly dataProvider: DataProvider;

    constructor() {
        this.modes.set('user-file-store', UserFileStore)
        this.modes.set('structure-file-store', StructureFileStore)
        this.modes.set('perf-store', PerfStore)
        const mode: string = config.get("user-store.mode");
        const storeConstructor: typeof DataProvider = <typeof DataProvider>(this.modes.get(mode));
        this.dataProvider = new storeConstructor();
    }

    public async initiate() {
        const mode: string = config.get("user-store.mode");
        const configuration = config.get(`user-store.modes.${mode}`);
        await this.dataProvider.load(configuration);
    }

    private getObject(dn: string): any {
        return this.dataProvider.get(dn);
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

    private convertToString(dn: any) {
        return dn.format({ upperName: true, skipSpace: true }).toString();
    }

    private findEntryOnBaseLevelScope(dn: any, filter: any): { dn: string; attributes: object; }[] {
        const results = [];
        const stringifiedDN = this.convertToString(dn);
        const obj = this.getObject(stringifiedDN);
        if (filter.matches(obj)) {
            results.push({
                dn: stringifiedDN,
                attributes: this.dataProvider.pack(obj)
            });
        }
        return results;
    }

    private findEntriesOnOneLevelScope(dn: any, filter: any): { dn: string; attributes: object; }[] {
        const results: { dn: string; attributes: object; }[] = [];
        for (const userDN of this.dataProvider.getAllUserDNs()) {
            const parent = ldap.parseDN(userDN).parent();
            if (dn.equals(userDN) == false && (parent == null || parent.equals(dn) == false)) { continue; }
            const obj = this.getObject(userDN);
            try {
                if (filter.matches(obj)) {
                    results.push({
                        dn: userDN,
                        attributes: this.dataProvider.pack(obj)
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
        for (const userDN of this.dataProvider.getAllUserDNs()) {
            if (dn.equals(userDN) == false && dn.parentOf(userDN) == false) { continue; }
            const obj = this.getObject(userDN);
            try {
                if (filter.matches(obj)) {
                    results.push({
                        dn: userDN,
                        attributes: this.dataProvider.pack(obj)
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
        const user:any = this.dataProvider.get(dn);
        if(user == null || user.password == null) {
            return false;
        }   
        return password == user.password; 
    }

    public get searchBase(): string {
        return this.dataProvider.getSearchBaseDN();
    }

    public hasSearchPermission(bindDN: string): boolean {
        const user:any = this.dataProvider.get(bindDN);
        if(user == null || user.permissions == null) {
            return false;
        }
        return user.permissions.include('search');
    }
}

