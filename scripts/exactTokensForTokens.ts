import { ethers } from "hardhat";
import helpers from "@nomicfoundation/hardhat-toolbox/network-helpers";

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

  // Define the amount of tokens to swap
  const amountOut = ethers.parseUnits("7000", 6); // 7000 USDC
  const amountIn = ethers.parseEther("1"); // 1 DAI

  // Get contract instances
  const USDC = await ethers.getContractAt("IERC20Token", USDCAddr);
  const DAI = await ethers.getContractAt("IERC20Token", DAIAddr);
  const ROUTER = await ethers.getContractAt("IUniswap", UNISwapRouter);

  // Approve the Uniswap Router to spend USDC tokens
  const approveTx = await USDC.connect(impersonatedSigner).approve(
    UNISwapRouter,
    amountOut
  );
  await approveTx.wait();

  // Get token balances before swap
  const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
  const daiBal = await DAI.balanceOf(impersonatedSigner.address);

  // Log token balances before swap
  console.log("USDC Balance:", ethers.formatUnits(usdcBal, 6));
  console.log("DAI Balance:", ethers.formatUnits(daiBal, 18));

  // Calculate deadline for the swap transaction
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

  // Execute the swap transaction
  const swapTx = await ROUTER.connect(
    impersonatedSigner
  ).swapExactTokensForTokens(
    amountOut,
    0,
    [USDCAddr, DAIAddr], // Swap USDC for DAI
    impersonatedSigner.address,
    deadline
  );
  await swapTx.wait();

  // Get token balances after swap
  const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);

  // Log token balances after swap
  console.log( "--------------------------------------------------");
  console.log( "--------------------------------------------------");
  console.log(
    "USDC balance after swap",
    ethers.formatUnits(usdcBalAfterSwap, 6)
  );
  console.log(
    "DAI balance after swap",
    ethers.formatUnits(daiBalAfterSwap, 18)
  );
};


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
