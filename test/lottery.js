const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery Contract", function () {
  let Lottery, lottery;
  let admin, user1, user2, user3;
  let entryFee, poolsize;

  beforeEach(async () => {
    [admin, user1, user2, user3] = await ethers.getSigners();

    poolsize = 3;
    entryFee = ethers.parseEther("1"); // BigInt in ethers v6

    Lottery = await ethers.getContractFactory("lottery");
    lottery = await Lottery.connect(admin).deploy(poolsize, entryFee);
    await lottery.waitForDeployment();
  });

  it("Should set the correct pool size and entry fee", async () => {
    expect(await lottery.poolsize()).to.equal(poolsize);
    expect(await lottery.entryFee()).to.equal(entryFee);
  });

  it("Should start with 0 participants", async () => {
    expect(await lottery.currentPoolSize()).to.equal(0);
  });

  it("Should accept exact entry fee and register participant", async () => {
    await user1.sendTransaction({ to: lottery.target, value: entryFee });
    expect(await lottery.currentPoolSize()).to.equal(1);
    const participant = await lottery.participants(0);
    expect(participant).to.equal(user1.address);
  });

  it("Should reject entry with less than entry fee", async () => {
    await expect(
      user1.sendTransaction({
        to: lottery.target,
        value: ethers.parseEther("0.5"),
      })
    ).to.be.revertedWith('"minimum fee" + entryFee');
  });

  it("Should return correct pool amount", async () => {
    await user1.sendTransaction({ to: lottery.target, value: entryFee });
    await user2.sendTransaction({ to: lottery.target, value: entryFee });
    const balance = await lottery.poolAmount();
    expect(balance).to.equal(entryFee * 2n); // BigInt math
  });

  it("Should not allow picking winner before enough participants", async () => {
    await user1.sendTransaction({ to: lottery.target, value: entryFee });
    await expect(lottery.connect(admin).winner()).to.be.revertedWith(
      "Pool does not have enough participants"
    );
  });

  it("Should pick winner and transfer balance", async () => {
    // Let 3 users join
    await user1.sendTransaction({ to: lottery.target, value: entryFee });
    await user2.sendTransaction({ to: lottery.target, value: entryFee });
    await user3.sendTransaction({ to: lottery.target, value: entryFee });

    const totalPool = entryFee * 3n;

    const beforeBalances = {
      [user1.address]: await ethers.provider.getBalance(user1.address),
      [user2.address]: await ethers.provider.getBalance(user2.address),
      [user3.address]: await ethers.provider.getBalance(user3.address),
    };

    const tx = await lottery.connect(admin).winner();
    await tx.wait();

    const lucky = await lottery.lucky();
    const afterBalance = await ethers.provider.getBalance(lucky);

    expect(afterBalance).to.be.greaterThan(beforeBalances[lucky]);
    expect(await lottery.currentPoolSize()).to.equal(0);
  });
});
