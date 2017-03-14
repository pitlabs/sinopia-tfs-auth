## Installation

```sh
$ npm install sinopia
$ npm install sinopia-tfs-auth
```

## Whats it for?

Authenticates the user by passing username and password to a TFS instance and
querying project collections that can be accessed by the user.

The project collections are returned as groups of the user.

## Config

Add to your `config.yaml`:

```yaml
auth:
  tfs-auth:
    url: https://tfs.example.com/tfs

packages:
  '@projectcollection/*':
    access: 'projectcollection'
    publish: admin
```

## Security Considertaions
Sinopia uses HTTP Basic auth requests. Please mind the usual security
considerations:
you are passing your TFS credentials through this - don't do via an
unencrypted channel. There is no excuse for not using HTTPS.
