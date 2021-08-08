const Cryptogram = artifacts.require("Cryptogram");
//migration files compiles and turns contracts into machine readable form
module.exports = function(deployer) {
  // Code goes here...
  deployer.deploy(Cryptogram);
};