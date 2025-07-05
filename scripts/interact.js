const hre = require("hardhat");

async function main() {
  const contractAddress = " 0xc7318Cf334F96B4cc087D34408391995ff0f167c"; // Your deployed contract address

  const signers = await hre.ethers.getSigners();

  // ✅ Check available signers
  console.log(`Available signers: ${signers.length}`);
  if (signers.length < 3) {
    throw new Error("Not enough signers in Ganache. Need at least 3.");
  }

  // Load ABI and contract
  const contractJSON = await hre.artifacts.readArtifact("lottery");
  const lottery = new hre.ethers.Contract(contractAddress, contractJSON.abi, signers[0]);

  console.log("Contract loaded at:", lottery.target);

  const entryFee = hre.ethers.parseEther("1");
  const totalPool = BigInt(entryFee) * 3n;
  // ✅ Have 3 signers join the lottery
  for (let i = 0; i < 3; i++) {
    const tx = await signers[i].sendTransaction({
      to: contractAddress,
      value: entryFee,
    });
    await tx.wait();
    console.log(`Signer ${i} joined the lottery`);
  }

  // ✅ Pick a winner
  const winnerTx = await lottery.connect(signers[0]).winner();
  await winnerTx.wait();

  const lucky = await lottery.lucky();
  console.log("🎉 Winner is:", lucky);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
