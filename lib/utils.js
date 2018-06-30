'use strict'

var fs = require('fs')
var chalk = require('chalk')
var child = require('child_process')
var normalize = require('path').normalize

function Utils() {}

Utils.prototype.validatePath = function(path) {
    try {
        if(path.includes('/')) {
            require.resolve(normalize(process.cwd() + path))
        }
        require.resolve(path)
    } catch(err) {
        throw Error(err)
    }
}

Utils.prototype.getConfigPath = function() {
    return process.cwd() + '/cypress.json'
}

Utils.prototype.getConfig = function() {
    var configPath = this.getConfigPath()
    var config = JSON.parse(this.readFile(configPath, 'utf8'))
    return config
}

Utils.prototype.getRoute = function(route) {
    var config = this.getConfig()
    return config.routes[route]
}

Utils.prototype.templateReplacement = function (template, placeholder, value) {
    return template.replace(`{{${placeholder}}}`, `"${value}"`)
}

Utils.prototype.mkdir = function(path, mode) {
    fs.mkdirSync(path, mode)
    console.log(`\n${chalk.green('created')} ${chalk.white(this.fileName(path))}\n`)
}

Utils.prototype.touchCreate = function(path, data, options) {
    fs.writeFileSync(path, data, options)
    console.log(`\n${chalk.green('created ')} ${chalk.white(this.fileName(path))}\n`)
}

Utils.prototype.touchUpdate = function(path, data, options) {
    fs.writeFileSync(path, data, options)
    
    console.log(`\n${chalk.green('updated ')} ${chalk.white(this.fileName(path))}\n`)
}

Utils.prototype.readFile = function(path, encoding) {
    return fs.readFileSync(path, encoding)
}

Utils.prototype.exec = function(command) {
    child.execSync(command, { cwd: process.cwd() })
}

Utils.prototype.fileName = function(path) {
    return path.split('/')[path.split('/').length - 1]
}

Utils.prototype.filterHTTPMethods = function(choices, picked) {
    return choices.filter(function(httpVerb) {
        return !picked.split(' ').includes(httpVerb)
    })
}

module.exports = Utils