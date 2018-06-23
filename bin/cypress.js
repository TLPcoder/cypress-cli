#!/usr/bin/env node
var program = require('commander')
var CypressCommand = require('../lib/core')

program
  .version('0.0.1', '-v, --version')
  .option('init', 'run math function', function(){ CypressCommand.init() })
  .option('-m, --model', '', function(){ console.log('models in progress') })
  .parse(process.argv);