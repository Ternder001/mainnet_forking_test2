import { ethers } from "hardhat";

async function main() {
  const initialOwner = "0x77158c23cc2d9dd3067a82e2067182c85fa3b1f6";
  const erc20Contract = await ethers.deployContract("MyToken", [
    initialOwner,
    "NicToken",
    "NKT",
  ]);

  await erc20Contract.waitForDeployment();

  console.log(`ERC20 Token contract deployed to ${erc20Contract.target}`);

  const saveERC20 = await ethers.deployContract("SaveERC20", [
    erc20Contract.target,
  ]);

  await saveERC20.waitForDeployment();

  console.log(`SaveERC20 contract deployed to ${saveERC20.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

