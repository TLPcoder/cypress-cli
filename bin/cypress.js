#!/usr/bin/env node
var program = require('commander')
var CypressCommand = require('../lib/core')

program
  .version('0.0.1', '-v, --version')
  .option('init', 'run math function', function(){ CypressCommand.init() })
  .option('--model', 'run math function', function(){ console.log('model bro') })
  .parse(process.argv);