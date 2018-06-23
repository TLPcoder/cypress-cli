'use strict'

var fs = require('fs')
var child = require('child_process')
var inquirer = require('inquirer')
var color = require('chalk')
// var beautiful = require('js-beautify')

function CypressCommand() {}

CypressCommand.prototype.init = function () {
    inquirer.prompt([{
            type: 'input',
            name: 'project_name',
            message: 'Project Name'
        },
        {
            type: 'input',
            name: 'project_description',
            message: 'Project Description'
        },
        {
            type: 'input',
            name: 'project_directory',
            message: 'Project Directory'
        },
    ]).then(function (answers) {
        this.project_name = answers.project_name
        this.project_description = answers.project_description
        this.project_directory = answers.project_directory
        this.createFileTree()
    }.bind(this))
}

CypressCommand.prototype.createFileTree = function () {
    var cypressConfig = this.readFile(__dirname + '/boiler-plates/cypress.txt')
    var app = this.readFile(__dirname + '/boiler-plates/app.txt')
    var dir = this.project_directory

    this.mkdir(dir)
    this.mkdir(`./${dir}/server`)
    this.touch(`./${dir}/server/app.js`, app)
    this.touch(`./${dir}/server/cypress.json`, cypressConfig)
    this.npmInit()
}

CypressCommand.prototype.npmInit = function () {
    var packageJson = this.readFile(__dirname + '/boiler-plates/package.txt', 'utf8')
    var structuredPackageJson = this.structurePackageJson(packageJson)
    var dir = this.project_directory

    this.touch(`./${dir}/package.json`, structuredPackageJson)
    this.exec(`cd ${dir} && npm install`)
    console.log(
        `\nDone running npm install for the required dependencies. If the command fails trying running ${color.yellow('npm install')} yourself\n`
    )
}

CypressCommand.prototype.structurePackageJson = function (packageJson) {
    var projectName = this.project_name
    var projectDescription = this.project_description

    packageJson = this.templateReplacement(packageJson, 'project-name', projectName)
    packageJson = this.templateReplacement(packageJson, 'description', projectDescription)

    return packageJson
}

CypressCommand.prototype.templateReplacement = function (template, placeholder, value) {
    return template.replace(`{{${placeholder}}}`, `"${value}"`)
}

CypressCommand.prototype.mkdir = function(path, mode) {
    fs.mkdirSync(path, mode)
    console.log(`${color.green('created')} ${color.white(this.fileName(path))}`)
}

CypressCommand.prototype.touch = function(path, data, options) {
    fs.writeFileSync(path, data, options)
    console.log(`${color.green('created')} ${color.white(this.fileName(path))}`)
}

CypressCommand.prototype.readFile = function(path, encoding) {
    return fs.readFileSync(path, encoding)
}

CypressCommand.prototype.exec = function(command) {
    child.execSync(command, { cwd: process.cwd() })
}

CypressCommand.prototype.fileName = function(path) {
    return path.split('/')[path.split('/').length - 1]
}

module.exports = new CypressCommand()