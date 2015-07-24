var Promise = require('bluebird');
var spawn = require('child_process').spawn;

var executablePath = '/usr/bin/security';

module.exports = {
  addPassword: function(service, account, password) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var security = spawn(executablePath, [ 'add-internet-password', '-a', account, '-s', service, '-w', password ]);
      security.on('exit', function(code, signal) {
        if (code !== 0) {
          var msg = 'Security returned a non-successful error code: ' + code;
          if (code === 45) { //duplicate
            deletePassword(account, service, password)
              .then(function() {
                addPassword(account, service, password);
              })
              .catch(function(err) {
                reject(err);
              });
          } else {
            return reject(new Error(msg));
          }
        } else {
         resolve(); // pw stored successfully
        }
      });
    });
  },
  getPassword: function(service, account) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var security = spawn(executablePath, [ 'find-internet-password', '-a', account, '-s', service, '-g' ]);
      var keychain = '';
      var password = '';

      security.stdout.on('data', function(d) {
        keychain += d.toString();
      });

      // For better or worse, the last line (containing the actual password) is actually written to stderr instead of stdout.
      // Reference: http://blog.macromates.com/2006/keychain-access-from-shell/
      security.stderr.on('data', function(d) {
        password += d.toString();
      });

      security.on('exit', function(code, signal) {
        if (code !== 0) {
          return reject(new Error('Could not find password for '+account+', '+service));
        }

        if (/password/.test(password)) {
          password = password.match(/"(.*)\"/, '')[1];
          resolve(password);
        } else {
          return reject(new Error('Could not find password for '+account+', '+service));
        }
      });
    });
  },
  deletePassword: function(service, account) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var security = spawn(executablePath, [ 'delete-internet-password', '-a', account, '-s', service ]);

      security.on('exit', function(code, signal) {
        if (code !== 0) {
          return reject(new Error('Could not find password'));
        } else {
          resolve();
        }
      });
    });
  }
};