"use strict";
const execSync = require('child_process').execSync;
const jwt = require('jsonwebtoken');
const chai = require('chai');
const expect = chai.expect;
const defaultsDeep = require('lodash/defaultsDeep');
const path = require('path');

describe('jwtq', () => {

  let defaults, cmd;
  beforeEach(() => {

    cmd = path.join(__dirname, '../src/index.js');

    defaults = {
      secret: 'secret',
      payload: {
        name: 'John Doe',
        admin: true
      },
      args: '',
      options: {
        subject: '1234567890'
      }
    }
  });

  const positiveTestCases = [
    {
      name: 'should decode tokens'
    }
  ];

  describe('as arguments', () => {

    positiveTestCases.forEach(testCase => {
      it(testCase.name, () => {
        const config = defaultsDeep({}, testCase, defaults);
        const token = jwt.sign(config.payload, config.secret, config.options);
        const result = execSync(`${cmd} ${config.args} ${token}`).
          toString('utf8').
          trim();
        expect(result).to.eql(JSON.stringify(jwt.decode(token)));
      });
    });

  });

  describe('piped', () => {

    positiveTestCases.forEach(testCase => {
      it(testCase.name, () => {
        const config = defaultsDeep({}, testCase, defaults);
        const token = jwt.sign(config.payload, config.secret, config.options);
        const result = execSync(`echo "${token}" | ${cmd} ${config.args}`).
          toString('utf8').
          trim();
        expect(result).to.eql(JSON.stringify(jwt.decode(token)));
      });
    });

  });

});

