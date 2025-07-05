require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: {
        mnemonic: "stadium soup dial crawl chunk rack used steel burger memory pizza high"
      }
    }
  }
};
