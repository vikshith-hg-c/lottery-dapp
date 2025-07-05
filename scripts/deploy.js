const hre = require("hardhat");

async function main() {
  const Lottery = await hre.ethers.getContractFactory("lottery");

  const poolsize = 3;
  const entryFee = hre.ethers.parseEther("1"); // 1 ETH in wei

  const lottery = await Lottery.deploy(poolsize, entryFee);

  //  Ethers v6 returns `lottery.waitForDeployment()`
  await lottery.waitForDeployment();

  //  use `lottery.target` instead of `lottery.address`
  console.log("Lottery contract deployed to:", lottery.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
