# SC-CHAT
A simple chat made with the MERNG stack
## Features
User and authentication
* User creation, update and deletion
* Stateless session authentication
* E-mail verification
* Password recovery
Conversation channels
* Channel creation, listing and deletion
* Channel accessability management
* Url metadata enrichment in messages
* Message filtering
## UI
Basic UI made with [Semantic UI React](https://react.semantic-ui.com/)
## Installation
Dependencies installation
```bash
npm run install
```
Execution
```bash
npm run start
```
## Configuration
**Database**

MongoDB is used for the data storage setting a default connection as indicated by the following connection string
```
mongodb://localhost:27017/sc_chat
```
If you would like to use your own reference database you can override these settings by assigning the appropriate values ​​to the following environmental variables:
```
SC_MONGODB_PREFIX
SC_MONGODB_USR
SC_MONGODB_PSW
SC_MONGODB_HOST
SC_MONGODB_PORT
SC_MONGODB_DBNAME
SC_MONGODB_OPTIONS
```

**E-mail sending and receiving**

[Ethereal](https://ethereal.email/) is used as the default mail transporter to send the user account verification e-mail and to recover the password. 
Log in with the following default credentials
```
username: noble74@ethereal.email 
password: gVh9g7PkvXnuSzhzkJ
```
or set up your custom mail transporter by assigning values ​​to the following environmental variables
```
SC_MAIL_TRASPORTER_HOST
SC_MAIL_TRASPORTER_PORT
SC_MAIL_TRASPORTER_USR
SC_MAIL_TRASPORTER_PSW
```
## License

MIT Licensed. Copyright (c) Mirko Monaco 2019.