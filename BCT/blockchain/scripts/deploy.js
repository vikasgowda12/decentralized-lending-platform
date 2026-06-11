const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("DecentralizedVoting");
  const contract = await Voting.deploy("Campus Election 2026", [
    "Alice Johnson",
    "Brian Lee",
    "Catherine Rao"
  ]);

  await contract.waitForDeployment();

  console.log("DecentralizedVoting deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

