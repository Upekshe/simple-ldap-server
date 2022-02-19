# Simple LDAP Auth Server

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)
[![Version](https://badge.fury.io/gh/tterb%2FHyde.svg)](https://badge.fury.io/gh/tterb%2FHyde)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/Upekshe/simple-ldap-server/graphs/commit-activity)


Simple LDAP/LDAPS protocol (authentication and search) emulating user-store for **test environments**

```markdown
Dockerized Releases: https://hub.docker.com/r/upekshejay/simple-ldap-test-server
```

## Intro

This is an easily configurable `TEST ENV ONLY` LDAP/LDAPS authentication and search action supported user store. The intention of this project is to support development and testing of applications which require LDAP(or LDAPS) for authentication. 
Though LDAP has several authtication mechanisms defined, this project only supports two. Those are
  - Anonymous
  - Simple (clear-text)

### Why?
When Software solution providers are asked to develop new systems to companies they require the support to plug the new systems to the existing Authentication michanism, Usually these Companies have Active Directory or OpenLDAP setup for authentication. So the easiest and the standard way of pluging in is by using the LDAP/LDAPS protocols.
When developed these authentication mechanism should be tested against a LDAP service. So either you have to configure a Active Directory or OpenLDAP server to test since on a testing (initial testing or UAT) stage inductry would not let you to link directly to their LDAP service.
So if you have a user store which can emulate both LDAP protocol and the companies OU structure, It makes everyone life easier since on the day of production you just have to change the LDAP service address from the test Service to the Actual service.

This LDAPJS based server is written to address all these issues. Please note this should be used for TESTING ONLY.

## How to use

Start the server,

Go to the simple-ldap-server folder and run `npm start`.

Or else for docker users run `docker run -p 389:389 -p 636:636 --name simple-ldap-server upekshejay/simple-ldap-test-server`
    
On both scenarios the server should start with a prompt similar to below


```
[2022-02-19T12:08:12.973] [INFO] default - Added DC=mtr,DC=com
[2022-02-19T12:08:12.984] [INFO] default - Added OU=users,DC=mtr,DC=com
[2022-02-19T12:08:12.990] [INFO] default - Added CN=admin,OU=users,DC=mtr,DC=com
[2022-02-19T12:08:12.992] [INFO] default - Added CN=kamal,OU=users,DC=mtr,DC=com
[2022-02-19T12:08:12.994] [INFO] default - Added CN=nimal,OU=users,DC=mtr,DC=com
[2022-02-19T12:08:12.996] [INFO] default - Added CN=anil,OU=users,DC=mtr,DC=com
[2022-02-19T12:08:12.999] [INFO] default - Added CN=supun,OU=users,DC=mtr,DC=com
[2022-02-19T12:08:13.000] [INFO] default - Added CN=dasun,OU=users,DC=mtr,DC=com
[2022-02-19T12:08:13.002] [INFO] default - Added CN=search_user,OU=users,DC=mtr,DC=com
[2022-02-19T12:08:13.089] [INFO] default - LDAP server up at: ldap://0.0.0.0:389
[2022-02-19T12:08:13.090] [INFO] default - LDAP server up at: ldaps://0.0.0.0:636
[2022-02-19T12:08:13.091] [INFO] default - LDAP Service initiation complete
```

Now the ldap server has exposeed its services.

To check everything works as intended, lets use the tool ldapserach, execute following command in a shell

```
ldapsearch -x -H ldap://127.0.0.1:389 -b "CN=nimal,OU=users,DC=mtr,DC=com" -D "CN=admin,OU=users,DC=mtr,DC=com" -W
```
The above command search the ldap server for the user 'nimal' with the credentials of the 'admin' user. When this is executed it will ask for the password of admin user, enter the password "itachi". Now ldapsearch should print a prompt similar to below

```
# extended LDIF
#
# LDAPv3
# base <CN=nimal,OU=users,DC=mtr,DC=com> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# nimal, users, mtr.com
dn: cn=nimal,ou=users,dc=mtr,dc=com
sAMAccountName: nimal
uid: nimal
userprincipalname: nimal
mailnickname: nimal
groups: lime_users|IT
cn: nimal
objectClass: User

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```

This indicates that server has responded with the search results including one user that matches the provided criteria

## Configurations

### System configurations

System level configurations are maintained inside the config folder


``sample configuration and description``

```jsonc
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

```jsonc
{
    "users": [
        /* 
        array that contains all the users
            simplest user entry should have a "id", for create an user with permissions
            add the property "permissions"
                currently allowed additional permissions are "search"
            an user entry can have any field and you can use that in the mapping inside the default json
        */
        {
            "id":"admin", /* id of the user */
            "permissions": ["search"]  /* permissions that are granted for the user */
            },
        {"id":"kamal"},
        {"id":"nimal"},
        {"id":"anil"},
        {"id":"supun"},
        {"id":"dasun"}
    ]
}
```

## How to use the Dockerized version

Simply start the contianer by running ``docker run``. Container will start with the preconfigured configurations. 

To run with a different configuration just run the container with mounted locations
