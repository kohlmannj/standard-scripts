#! /usr/bin/env node
const createUpdateCommand = require('../src')({ isDefaultCommand: true });

// eslint-disable-next-line
require('yargs').command(createUpdateCommand).yargs;
