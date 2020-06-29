# simple-ldap-auth-server
Simple LDAP/LDAPS protocol emulating user-store to use in test environments to support user authentication

Dockerized releases
https://hub.docker.com/r/upekshejay/simple-ldap-test-server

When you develop software for the customers most of the companies seek the capability of LDAP integration. Because it is easier for the users since they can use their existing usernames and passwords to login to the new system. 

In order to support that developers have to implement ldap support for the system and to test this feature a ldap server is required. For that someone has to install and configure either Active Directory or OpenLDAP. But that is kind of a time consuming/boring process. Also when the software is deployed in customer site for user acceptance testing usually the customer does not like to give permissions to access their entrprise LDAP service for testing. So to address all these issues its easier to use a dockerize ldap server in test systems. It should be easier to configure since different customers have different configurations(dn, dc and all that) and they have different users.

This simple ldap/ldaps server is written to address all these issues. This is not a production ready LDAP server, But just a simply configurable user store which supports LDAP/LDAPS protocols. This uses ldapjs library server code to implement LDAP support
