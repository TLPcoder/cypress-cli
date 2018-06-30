'use strict'

var fs = require('fs')
var child = require('child_process')
var inquirer = require('inquirer')
var chalk = require('chalk')
var Utils = require('./utils')

function CypressCommand() {
    this.utils = new Utils()
}

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
    ]).then(function (init) {
        this.project_name = init.project_name
        this.project_description = init.project_description
        this.project_directory = init.project_directory
        this.createFileTree()
    }.bind(this))
}

CypressCommand.prototype.createRoute = function () {
    inquirer.prompt([{
            type: 'input',
            name: 'path',
            message: 'Choose path for route'
        }])
        .then(function (route) {
            return Promise.all([route, this.getRouteMethods()])
        }.bind(this))
        .then(function (arr) {
            var route = arr[0]
            var methods = arr[1]
            return Promise.all([route, methods, this.getMiddlewarePath()])
        }.bind(this))
        .then(function (arr) {
            var route = arr[0]
            var methods = arr[1].trim()
            var path = arr[2]
            var config = this.utils.getConfig()
            var configPath = this.utils.getConfigPath()
            var httpVerbs = methods.split(' ')
            config.routes[route.path] = {
                methods: methods.split(' '),
                middlewarePath: path,
                config: {}
            }
            this.utils.touchUpdate(configPath, JSON.stringify(config, null, 4))
        }.bind(this))
        .catch(function (err) {
            console.log(err)
        })
}

CypressCommand.prototype.editRoute = function () {
    var config = this.utils.getConfig()
    var configPath = this.utils.getConfigPath()
    var routes = config.routes
    var choices = Object.keys(routes)

    return inquirer.prompt([{
        type: 'list',
        choices: choices,
        name: 'route_path',
        message: 'choose a route to edit'
    }]).then(function (argv) {
        console.log('\nRoute to edit', argv.route_path + '\n')

        var route = routes[argv.route_path]

        return Promise.all([
            argv.route_path,
            inquirer.prompt([{
                type: 'list',
                choices: Object.keys(route),
                name: 'route_node',
                message: 'What would you like to edit?'
            }])
        ])
    }).then(function (argv) {
        var routePath = argv[0]
        var node = argv[1].route_node

        if (node === 'methods') {
            console.log('\ncurrent methods', routes[routePath][node].join(' ') + '\n')
            return this.getRouteMethods()
                .then(function (newMethods) {
                    routes[routePath][node] = newMethods.trim().split(' ')
                    this.utils.touchUpdate(configPath, JSON.stringify(config, null, 4))
                }.bind(this))
        }

        if (node === 'middlewarePath') {
            console.log('\n current route path ' + routes[routePath][node] + '\n')
            return this.getMiddlewarePath(routePath)
                .then(function (middlewarePath) {
                    routes[routePath][node] = middlewarePath.trim()
                    this.utils.touchUpdate(configPath, JSON.stringify(config, null, 4))
                }.bind(this))
        }

        if (node === 'config') {

        }

    }.bind(this)).catch(function (err) {
        console.log(err)
    })
}

CypressCommand.prototype.getRouteMethods = function (methods = '') {

    var choices = this.utils.filterHTTPMethods(
        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'DONE'], methods
    )

    return inquirer.prompt([{
        type: 'list',
        choices: choices,
        name: 'method',
        message: 'choose methods for route'
    }]).then(function (http) {

        if (http.method === 'DONE') {
            return methods
        }

        console.log(chalk.green('\nMethod Pickeds:', http.method + ' ' + methods))

        return this.getRouteMethods(http.method + ' ' + methods)

    }.bind(this)).catch(function (err) {
        console.log(err)
    })

}

CypressCommand.prototype.getMiddlewarePath = function () {
    return inquirer.prompt([{
        type: 'input',
        name: 'middleware_path',
        message: 'Path to function from root dir for route'
    }]).then(function (path) {
        this.utils.validatePath(path)
        return path.middleware_path
    })
}
CypressCommand.prototype.createFileTree = function () {
    var cypressConfig = this.utils.readFile(__dirname + '/boiler-plates/cypress.txt')
    var app = this.utils.readFile(__dirname + '/boiler-plates/app.txt')
    var dir = this.project_directory

    this.utils.mkdir(dir)
    this.utils.mkdir(`./${dir}/server`)
    this.utils.touchCreate(`./${dir}/server/app.js`, app)
    this.utils.touchCreate(`./${dir}/cypress.json`, cypressConfig)
    this.npmInit()
}

CypressCommand.prototype.npmInit = function () {
    var packageJson = this.utils.readFile(__dirname + '/boiler-plates/package.txt', 'utf8')
    var structuredPackageJson = this.structurePackageJson(packageJson)
    var dir = this.project_directory

    this.utils.touchCreate(`./${dir}/package.json`, structuredPackageJson)
    this.utils.exec(`cd ${dir} && npm install`)
    console.log(
        `\nDone running npm install for the required dependencies. If the command fails trying running ${chalk.yellow('npm install')} yourself\n`
    )
}

CypressCommand.prototype.structurePackageJson = function (packageJson) {
    var projectName = this.project_name
    var projectDescription = this.project_description

    packageJson = this.utils.templateReplacement(packageJson, 'project-name', projectName)
    packageJson = this.utils.templateReplacement(packageJson, 'description', projectDescription)

    return packageJson
}

module.exports = new CypressCommand()