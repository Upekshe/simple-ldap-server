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

All the configurations are maintained inside the config folder


``sample configuration``
```
{
    "user-store": {
        "mode": "user-file-store",
        "modes": {
            "user-file-store": {
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
            },
            "templated": {}
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
### Company structure

