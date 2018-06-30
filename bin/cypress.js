#!/usr/bin/env node
var program = require('commander')
var CypressCommand = require('../lib/core')

program
  .version('0.0.1', '-v, --version')
  .option('-i, init', 'create cypress application', function(){ CypressCommand.init() })
  .option('-c, create-route', 'create a route', function(){ CypressCommand.createRoute() })
  .option('-e, edit-route', 'edit a route', function(){ CypressCommand.editRoute() })
  .parse(process.argv);
