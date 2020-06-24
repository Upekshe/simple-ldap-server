import { DataProvider } from "./abstract-data-provider";

export class StructureFileStore extends DataProvider {
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
    load(users: Map<string, any>): Promise<any> {
        throw new Error("Method not implemented.");
    }
}