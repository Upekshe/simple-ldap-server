export class UserStore {

    private getObject(key: string): any {

    }

    public find(dn: any, scope: string, filter: any): { dn: string; attributes: object; }[] {
        throw new Error("Method not implemented.");
        const results = [];
        switch (scope) {
            case 'base':
                // matches the requested DN only
                const obj = this.getObject(dn);
                if (filter.matches(obj)) {
                    results.push({
                        dn: dn,
                        attributes: obj
                    });
                }
                break;

            case 'one':
                break;
            case 'sub':
                break;
            default:
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