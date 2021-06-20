const { UserFileStore } = require("../lib/user-store/file-store");

describe('User file store', () => {
    let userFileStore;
    beforeAll(() => {
        console.log("Before All","Creating UserFileStore")
        userFileStore = new UserFileStore();
    });

    test('File store should load from config', async () => {
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

})