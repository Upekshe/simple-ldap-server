export class DataProvider {
    constructor() { }
    get(dn: string) {
        throw new Error("Method not implemented.");
    }
    getAllUserDNs(): string[] {
        throw new Error("Method not implemented.");
    }
    getSearchBaseDN(): string {
        throw new Error("Method not implemented.");
    }
    pack(obj: any): object {
        throw new Error("Method not implemented.");
    }
    load(config: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
}