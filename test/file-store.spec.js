const { UserFileStore } = require("../lib/user-store/file-store");

describe('User file store', () => {
    let userFileStore;
    beforeAll(() => {
        console.log("Before All", "Creating UserFileStore")
        userFileStore = new UserFileStore();
    });

    test('should load from config', async () => {
        const storeJson = {
            "users": [
                { "id": "admin", "permissions": ["search"] },
                { "id": "user01" },
                { "id": "user02" },
                { "id": "manager01" }
            ]
        };
        const config = {
            "location": "/app/etc/store.json",
            "users-array-name": "users",
            "common-password": "itachi",
            "user-group-ou": "ou=users",
            "root-entry": "dc=mtr,dc=com",
            "attribute-mapping": {
                "sAMAccountName": "obj.id",
                "uid": "obj.id",
                "userprincipalname": "obj.id",
                "mailnickname": "obj.id",
                "groups": "lime_users|IT",
                "cn": "obj.id",
                "password": "obj.credential",
                "objectClass": "User",
                "permissions": "obj.permissions"
            },
            "optional": {
                "search-permitted-users": [
                    {
                        "dn": "cn=search_user,ou=users,dc=mtr,dc=com",
                        "password": "sasuke"
                    }
                ]
            }

        }
        const entryCount = await userFileStore.load(config, storeJson);
        await expect(entryCount).toBe(7); // root entry, user group entry, search user entry and three users from the array
    });

    test('should give correct entry count', () => {
        const count = userFileStore.getUserCount();
        expect(count).toBe(7)
    });

    test('should get base dn', () => {
        const baseDn = userFileStore.getSearchBaseDN();
        expect(baseDn).toBe("ou=users,dc=mtr,dc=com")
    });

    test('should get a specific user', () => {
        const user01Dn = 'CN=user01,OU=users,DC=mtr,DC=com'
        const user01 = userFileStore.get(user01Dn);
        expect(user01.cn).toBe("user01")
        expect(user01.uid).toBe("user01")
        expect(user01.objectClass).toBe("User")
        expect(user01.sAMAccountName).toBe("user01");

        const user02Dn = 'CN=manager01,OU=users,DC=mtr,DC=com'
        const user02 = userFileStore.get(user02Dn);
        expect(user02.cn).toBe("manager01")
        expect(user02.uid).toBe("manager01")
        expect(user02.objectClass).toBe("User")
        expect(user02.sAMAccountName).toBe("manager01");
    });

    test('should get all user dns',()=>{
        const allEntries = userFileStore.getAllUserDNs();
        expect(allEntries.length).toBe(7);
        expect(allEntries).toContain("DC=mtr,DC=com");
        expect(allEntries).toContain("OU=users,DC=mtr,DC=com");
        expect(allEntries).toContain("CN=admin,OU=users,DC=mtr,DC=com");
        expect(allEntries).toContain("CN=user01,OU=users,DC=mtr,DC=com");
        expect(allEntries).toContain("CN=user02,OU=users,DC=mtr,DC=com");
        expect(allEntries).toContain("CN=manager01,OU=users,DC=mtr,DC=com");
        expect(allEntries).toContain("CN=search_user,OU=users,DC=mtr,DC=com");
    });
})