var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var executablePath;
try {
  executablePath = which.sync('powershell.exe');
} catch(e) {
  executablePath = 'powershell.exe';
}

var credManScript = path.join(path.dirname(path.dirname(__dirname)), 'bin', 'CredMan.ps1');

module.exports = {
  addPassword: function(service, account, password) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var powerShellSubprocess = spawn(executablePath, [ credManScript, '-AddCred', '-Target', service, '-User', account, '-Pass', password ]);
      powerShellSubprocess.on('exit', function(code, signal) {
        if (code !== 0) {
          return reject(new Error('Could not add password'));
        } else {
         resolve(); // pw stored successfully
        }
      });
    });
  },
  getPassword: function(service, account) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var powerShellSubprocess = spawn(executablePath, [ credManScript, '-GetCred', '-Target', account ]);
      var password = '';
      var error = '';

      powerShellSubprocess.stdout.on('data', function(d) {
        password += d.toString();
      });

      powerShellSubprocess.stderr.on('data', function(d) {
        error += d.toString();
      });

      powerShellSubprocess.on('exit', function(code, signal) {
        if (code !== 0) {
          return reject(new Error('Could not find password for '+account+', '+service));
        }

        if (password.length > 0) {
          resolve(password);
        } else {
          return reject(new Error('Could not find password for '+account+', '+service+': '+error));
        }
      });
    });
  },
  deletePassword: function(service, account) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var powerShellSubprocess = spawn(executablePath, [ credManScript, '-DelCred', '-Target', account ]);

      powerShellSubprocess.on('exit', function(code, signal) {
        if (code !== 0) {
          return reject(new Error('Could not find password'));
        } else {
          resolve();
        }
      });
    });
  }
};