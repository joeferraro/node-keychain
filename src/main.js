var os = require('os');

var platforms = {
  darwin: 'osx',
  win32: 'win',
  linux: 'linux'
};

var Keychain = function() {
  this.impl = require('./'+platforms[os.platform()])
};

Keychain.prototype.addPassword = function(service, account, password) {
  if (!service || !account || !password) {
    throw new Error('You must provide a service, account, and password');
  }
  return this.impl.addPassword(service, account, password);
};

Keychain.prototype.getPassword = function(service, account) {
  if (!service || !account) {
    throw new Error('You must provide a service and an account');
  }
  return this.impl.getPassword(service, account);
};

Keychain.prototype.deletePassword = function(service, account) {
  if (!service || !account) {
    throw new Error('You must provide a service and an account');
  }
  return this.impl.deletePassword(service, account);
};

module.exports = new Keychain();