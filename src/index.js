#!/usr/bin/env node
'use strict';
const pkg = require('../package.json');
const program = require('commander');
const pick = require('lodash.pick');
const readline = require('readline');
const Bluebird = require('bluebird');
const jwt = require('jsonwebtoken');

const nameRe = new RegExp(`\\b${pkg.name}\\b`);
const debugEnv = process.env.NODE_DEBUG;
const isDebug = debugEnv && (
  debugEnv === '1' || debugEnv === 'true' || nameRe.test(debugEnv)
);

const VERIFY_OPTIONS = [
  'algorithms',
  'audience',
  'issuer',
  'ignoreExpiration',
  'ignoreNotBefore',
  'subject',
  'clockTolerance'
];
const DECODE_OPTIONS = [
  'json',
  'complete'
];

function collect(val, memo) {
  if (!memo) {
    memo = [];
  }
  memo.push(val);
  return memo;
}

program.
  version(pkg.version).
  usage('[options] [token]').
  option('-v, --verify <secret>', 'Verify the jwt using the supplied secret').
  // verify options
  option('-A, --algorithm <value>', 'Algorithm to use for verification. Defaults to HS256. May be provided multiple times.', collect).
  option('-i, --issuer <value>', 'If you want to check issuer (iss), provide a value here. May be provided multiple times.', collect).
  option('-a, --audience <value>', 'If you want to check audience (aud), provide a value here.').
  option('-s, --subject <value>', 'If you want to check subject (sub), provide a value here.').
  option('--ignore-expiration', 'Do not validate the expiration of the token.').
  option('--ignore-not-before', 'Do not validate the not before claim of the token.').
  option('--clock-tolerance', 'Number of second to tolerate when checking the nbf and exp claims.', parseInt, 0).
  // decode options
  option('-j, --json', 'If supplied, decodes the JWT headers as well as the payload.').
  option('-c, --complete', 'If supplied, decodes the JWT headers as well as the payload.').
  // gogogo
  parse(process.argv);

const token = program.args[0];

if (isDebug) {
  console.info(`${pkg.name}:`, pick(program, VERIFY_OPTIONS.concat(DECODE_OPTIONS)));
}

// the jwtUtil returns a promise; here's how we handle it
function output(promise) {
  promise.
    then(result => process.stdout.write(`${result}\n`)).
    catch(e => console.error(isDebug ? e.stack : e.toString()));
}

// actually proces the jwt
function jwtUtil(token) {
  return Bluebird.
    try(() => program.verify ?
      jwt.verify(token, program.verify, pick(program, VERIFY_OPTIONS)) :
      jwt.decode(token, pick(program, DECODE_OPTIONS))
    ).
    then(result => JSON.stringify(result));
}

// we received a token, process it
if (token) {
  output(jwtUtil(token, program));

// otherwise if we're a tty, we were called with no args
} else if (process.stdin.isTTY) {
  console.info(`${pkg.name} v${pkg.version}`);
  console.info(pkg.description);
  program.help();

// otherwise listen for one to be piped in
} else {
  const rl = readline.createInterface({
    input: process.stdin
  });
  const pauseReader = () => Bluebird.
    resolve(rl.pause()).
    disposer(() => rl.resume());

  rl.on('line', line => {
    // pause the reader on each line to assure order is correct
    Bluebird.using(
      pauseReader(),
      () => output(jwtUtil(line, program))
    );
  });
}
