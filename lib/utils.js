'use strict'

var fs = require('fs')
var chalk = require('chalk')
var child = require('child_process')
var normalize = require('path').normalize

function Utils() {}

/**
 * checks while running cypress command user is in correct directory
 */

Utils.prototype.correctDir = function() {
    try {
       this.readFile(this.getConfigPath())
    } catch(err) {
        throw new Error('cypress.json not found, you may not be in root directory of your cypress project.')
    }
}

/**
 * validates the path for a module is correct
 * @param {String=} path 
 * @returns {String}
 */

Utils.prototype.validatePath = function(path) {
    try {
        if(path.includes('/')) {
            return require.resolve(normalize(process.cwd() + '/' + path))
        }
        return require.resolve(process.cwd())
    } catch(err) {
        throw new Error(err)
    }
}

/**
 * get path to cypress.json
 * @returns {String}
 */

Utils.prototype.getConfigPath = function() {
    return process.cwd() + '/cypress.json'
}

/**
 * returns cypress.json file
 * @returns {String}
 */

Utils.prototype.getConfig = function() {
    var configPath = this.getConfigPath()
    var config = JSON.parse(this.readFile(configPath, 'utf8'))
    return config
}

/**
 * returns specific route from cypress.json
 * @param {String=} route 
 * @returns {String}
 */

Utils.prototype.getRoute = function(route) {
    var config = this.getConfig()
    return config.routes[route]
}

/**
 * replaces a placeholder in a template with the value given
 * @param {String=} template 
 * @param {String=} placeholder 
 * @param {String=} value
 * @returns {String} 
 */
Utils.prototype.templateReplacement = function (template, placeholder, value) {
    return template.replace(`{{${placeholder}}}`, `"${value}"`)
}

/**
 * creates directory
 * @param {String=} path 
 * @param {String} mode 
 */

Utils.prototype.mkdir = function(path, mode) {
    fs.mkdirSync(path, mode)
    console.log(`${chalk.green('created')} ${chalk.white(this.fileName(path))}\n`)
}

/**
 * Creates file
 * @param {String=} path 
 * @param {String=} data 
 * @param {String=} options 
 */
Utils.prototype.touchCreate = function(path, data, options) {
    fs.writeFileSync(path, data, options)
    console.log(`${chalk.green('created ')} ${chalk.white(this.fileName(path))}\n`)
}

/**
 * updates a file
 * @param {String=} path 
 * @param {String=} data 
 * @param {String=} options 
 */
Utils.prototype.touchUpdate = function(path, data, options) {
    fs.writeFileSync(path, data, options)
    
    console.log(`\n${chalk.green('updated ')} ${chalk.white(this.fileName(path))}\n`)
}

/**
 * returns file content
 * @param {String=} path 
 * @param {String=} encoding 
 */

Utils.prototype.readFile = function(path, encoding) {
    return fs.readFileSync(path, encoding)
}

/**
 * runs commands in CWD
 * @param {String=} command 
 */
Utils.prototype.exec = function(command) {
    child.execSync(command, { cwd: process.cwd() })
}

/**
 * retuns file name
 * @param {String=} path
 * @returns {String}
 */
Utils.prototype.fileName = function(path) {
    return path.split('/')[path.split('/').length - 1]
}

/**
 * returns array of http methods not yet picked.
 * @param {Array=} choices 
 * @param {String=} picked 
 */

Utils.prototype.filterHTTPMethods = function(choices, picked) {
    return choices.filter(function(httpVerb) {
        return !picked.split(' ').includes(httpVerb)
    })
}

module.exports = Utils