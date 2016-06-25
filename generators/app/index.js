'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var camelCase = require('camel-case');
var capitalize = require('capitalize');
var walk = require('fs-walk').walk;
var fs = require('fs');

module.exports = yeoman.Base.extend({
  initializing: function () {
    // Use nativescript-plugin-seed npm module as template
    this.sourceRoot(path.join(__dirname, '../../node_modules/nativescript-plugin-seed/'));
    this.options = {
      author: {
        name: this.user.git.name(),
        email: this.user.git.email()
      }
    };
  },

  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the solid ' + chalk.red('generator-nativescript-plugin') + ' generator!'
    ));

    var prompts = [{
      type: 'confirm',
      name: 'someAnswer',
      message: 'Would you like to enable this option?',
      default: true
    }, {
        type: 'input',
        name: 'name',
        message: 'What is your plugin name?',
        default: 'yourplugin'
      }, {
        type: 'input',
        name: 'username',
        message: 'What is your GitHub user name?',
        default: 'someuser'
      }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;

      var name = props.name.replace(/\ /g, '-');
      this.options.name = {
        dashed: name,
        camel: camelCase(name),
        spaced: capitalize(name.replace(/\-/, '-'))
      };

      // TDOD: validate user name if it contain illegal chars
      var username = props.username.replace(/\ /g, '');
      this.options.author.githubId = username;

    }.bind(this));
  },


  writing: {
    dest: function () {
      var root = this.sourceRoot();
      this.destinationRoot(path.join(this.destinationRoot(), this.options.name.dashed));
      var dest = this.destinationRoot();
      var that = this;

      var execute = function (basedir, filename, stat, next) {
        var relativePath = basedir.replace(root, '');
        var filePath = path.join(basedir, filename);
        //console.log('relative: ' + relativePath);

        if (stat.isDirectory()) {
          fs.mkdir(path.join(dest, relativePath, filename), next);
          //console.log('dir: ' + filePath);
          walk(filePath, execute, function (err) {
            //console.error('Error on file dir: ' + err);
          });
          return;
        }

        //console.log('file: ' + filePath);
        fs.readFile(filePath, function (err, stream) {
          if (err) {
            return console.error('Error reading file: ' + err);
          }

          // Replace src
          else if (filename.indexOf('yourplugin') > -1) {
            filename = filename.replace('yourplugin', that.options.name.dashed);
          }

          var fileString = stream.toString();
          var writeFilePath = path.join(dest, relativePath, filename);

          // Templating
          fileString = fileString.replace(/nativescript-plugin-seed/g, 'nativescript-' + that.options.name.dashed);
          fileString = fileString.replace(/[Y|y]our[P|p]lugin/g, that.options.name.camel);
          //fileString = fileString.replace(/the.directive/g, that.options.author.githubId + '.' + that.options.name.dashed);
          fileString = fileString.replace(/nativescript-yourplugin/g, 'nativescript-' + that.options.name.dashed);
          fileString = fileString.replace(/yourplugin.android.ts/g, that.options.name.dashed + '.android.ts');
          fileString = fileString.replace(/yourplugin.common.ts/g, that.options.name.dashed + '.common.ts');
          fileString = fileString.replace(/yourplugin.ios.ts/g, that.options.name.dashed + '.ios.ts');
          fileString = fileString.replace(/yourplugin.js/g, that.options.name.dashed + '.js');
          fileString = fileString.replace(/[y|Y]ou [n|N]ame/g, that.options.name.spaced);
          fileString = fileString.replace(/YourName/g, that.options.author.name);
          fileString = fileString.replace(/NathanWalker/g, that.options.author.githubId);
          //fileString = fileString.replace(/<mazimi@apigee.com>/g,'<' + that.options.author.email + '>');
          //fileString = fileString.replace('Angular Publishable Directive Template', '');


          fs.writeFile(writeFilePath, fileString, next);
        });
      };

      walk(root, execute, function (err) {
        //console.error('Error procesing file: ' + err);
      });
    }
  },

  install: function () {
    this.npmInstall();
  },

  end: function () {
    this.log(yosay(
      'Happy coding... ' + chalk.green('enjoy') + ' you plugin!'
    ));
  }
});
