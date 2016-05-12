# jwtq

Command-line utility for inspecting and verifying JSON Web Tokens

```bash
// TODO: publish to npm
npm install -g jwtq
```

Inspired heavily by [jq](https://stedolan.github.io/jq/), this utility makes
working with JSON Web Tokens a little bit easier. It provides a simple unix-style interface and supports piping between applications.

## Examples

The most simple usage to decode a token:

```bash
$ jwtq eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
{"sub":"1234567890","name":"John Doe","admin":true}
```

Or verify one:

```bash
$ jwtq --verify secret eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
{"sub":"1234567890","name":"John Doe","admin":true}
```

It also supports piping to stdin:

```bash
curl -s localhost/token | jq -r '.id_token' | jwtq | jq '.'
```

And supports a ton of options, visible on the `man` page or via

```bash
jwtq --help
```


