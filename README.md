# Simple LDAP Auth Server

Simple LDAP/LDAPS protocol emulating user-store to use in test environments

```
Dockerized Releases: https://hub.docker.com/r/upekshejay/simple-ldap-test-server
```

## Introduction

This is a `TEST ENV ONLY` easily configurable LDAP/LDAPS protocol emulator

### Why?
When Software solution providers are asked to develop new systems to companies they require the support to plug the new systems to the existing Authentication michanism, Usually these Companies use Active Directory or OpenLDAP for authentication. So the easiest and the standard way of pluging in is by using the LDAP/LDAPS protocols.
When developed these authentication mechanism should be tested against a LDAP service. So either you have to configure a Active Directory or OpenLDAP server to test since on a testing (initial testing or UAT) stage inductry would not let you to directly link to their LDAP service.
So if you have a user store which can emulate both LDAP protocol and the companies OU structure, It makes everyone life easier since on the day of production you just have to change the LDAP service address from the test Service to the Actual service.

This LDAPJS based server is written to address all these issues. Please note this should be used for TESTING ONLY.

## Configurations

### System configurations

System level configurations are maintained inside the config folder


``sample configuration and description``

```
{
    "user-store": { /* defines the way to load users to the ldap service */
        "mode": "user-file-store", /* current running mode */
        "modes": {
            /* 
            all the modes that are defines goes in here. One of these defined methods should 
            be used in 'user-store.mode'
            modes: 
                "user-file-store"
                "structure-file-store" NOT SUPPORTED YET
                "perf-store"           NOT SUPPORTED YET    
            */
            "user-file-store": {
                /* 
                defines the user file store, 
                which supports loading users from a file to a one specific user group
                */
                "location": "/app/etc/store.json", /* location of the file. File should be a json*/
                "users-array-name": "users", /* property name of the user array*/
                "common-password": "itachi", /* password for all the users */
                "user-group-ou": "ou=users", /* User group that all the defined users are linked to*/
                "root-entry": "dc=mtr,dc=com", /* DC of the structure */
                "attribute-mapping": {
                    /*
                        Attribute ,apping goes inside here.
                        Key is the id of the attribute in the LDAP user record, 
                        value is the mapping that should be used to retrieve the actual value (from the Object or direct)
                            Notation
                            If User object { "id": "sakura", "credentials": "asdf" }
                            and if we want to populate "uid" attribute from the "id" field of the object

                            ``
                            "uid": "obj.id"
                            ``

                            If want to populate "objectClass" from a static value "User"
                            ```
                            "objectClass": "User"
                            ```
                    */
                    "sAMAccountName": "obj.id",
                    "uid": "obj.id",
                    "userprincipalname": "obj.id",
                    "mailnickname": "obj.id",
                    "groups": "lime_users|IT",
                    "cn": "obj.id",
                    "password": "obj.credential", /* if this is null common passowrd will be used*/
                    "objectClass": "User",
                    "permissions": "obj.permissions"
                },
                "optional": {
                    /*
                        configurations inside this section are optional and it is not necessary to fill these
                    */
                    "search-permitted-users": [
                        /*
                            allow adding additional users with search permission
                        */
                        {
                            "dn": "cn=search_user,ou=users,dc=mtr,dc=com", /* complete DN of the user*/
                            "password": "sasuke" /* password for this specific user */
                        }
                    ]
                }
            },
            "structure-file-store": {}
        }
    },
    "anonymous-bind": {
        "enabled": true
    },
    "protocols": {
        "ldap": {
            "enabled": true,
            "port": 389
        },
        "ldaps": {
            "enabled": true,
            "port": 636,
            "key-location": "/app/cert/key.pem",
            "cert-location": "/app/cert/cert.pem"
        }
    }
}
```

### Store structure

There are multiple types of store structures each store has diffrent one

#### User store (user-file-store)

``sample configuration and description``

```
{
    "users": [
        {"id": "admin", "permissions": ["search"]},
        {"id":"kamal"},
        {"id":"nimal"},
        {"id":"anil"},
        {"id":"supun"},
        {"id":"dasun"}
    ]
}
```