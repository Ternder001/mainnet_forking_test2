// Import necessary libraries
import { ethers } from "hardhat";
import helpers from "@nomicfoundation/hardhat-toolbox/network-helpers";

// Define main function
const main = async () => {
  // Specify addresses for USDC and DAI tokens
  const USDCAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  // Specify the Uniswap Router contract address
  const UNISwapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  // Specify the address being impersonated
  const USDCImpersonatingAddr = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  // Get an impersonated signer
  const impersonatedSigner = await ethers.getImpersonatedSigner(USDCImpersonatingAddr);

  // Define the amounts of USDC and DAI tokens
  const amountUSDC = ethers.parseUnits("5000", 6); // 5000 USDC
  const amountDAI = ethers.parseUnits("5000", 18); // 5000 DAI

  // Get contract instances
  const USDC = await ethers.getContractAt("IERC20Token", USDCAddr);
  const DAI = await ethers.getContractAt("IERC20Token", DAIAddr);
  const ROUTER = await ethers.getContractAt("IUniswap", UNISwapRouter);

  // Approve the Uniswap Router to spend USDC tokens
  const approveTxUSDC = await USDC.connect(impersonatedSigner).approve(
    UNISwapRouter,
    amountUSDC
  );
  await approveTxUSDC.wait();

  // Approve the Uniswap Router to spend DAI tokens
  const approveTxDAI = await DAI.connect(impersonatedSigner).approve(
    UNISwapRouter,
    amountDAI
  );
  await approveTxDAI.wait();

  // Get token balances before adding liquidity
  const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
  const daiBal = await DAI.balanceOf(impersonatedSigner.address);

  // Log token balances before adding liquidity
  console.log("USDC Balance before add LIQUIDITY:", ethers.formatUnits(usdcBal, 6));
  console.log("DAI Balance before add LIQUIDITY:", ethers.formatUnits(daiBal, 18));

  // Calculate deadline for the liquidity addition transaction
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

  // Execute the liquidity addition transaction
  const liquidityTx = await ROUTER.connect(impersonatedSigner).addLiquidity(
    USDCAddr,
    DAIAddr,
    amountUSDC,
    amountDAI,
    0, // Minimum amount of liquidity tokens to receive (set to 0)
    0, // Minimum amount of ETH to receive (set to 0)
    impersonatedSigner.address,
    deadline
  );
  await liquidityTx.wait();

  // Get token balances after adding liquidity
  const usdcBalAfterLiquidity = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfterLiquidity = await DAI.balanceOf(impersonatedSigner.address);

  // Log token balances after adding liquidity
  console.log( "--------------------------------------------------");
  console.log( "--------------------------------------------------");
  console.log(
    "USDC balance after add LIQUIDITY:",
    ethers.formatUnits(usdcBalAfterLiquidity, 6)
  );
  console.log(
    "DAI balance after add LIQUIDITY:",
    ethers.formatUnits(daiBalAfterLiquidity, 18)
  );
};

// Execute main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

