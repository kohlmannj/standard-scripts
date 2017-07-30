#!/usr/bin/env node
// Use the `standard-scripts` command as the default command
const command = require('../src/commandFactory')({ isDefaultCommand: true });

// eslint-disable-next-line
require('yargs')
  .command(command)
  .argv;
