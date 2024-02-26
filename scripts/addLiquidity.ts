import { ethers } from "hardhat";
import helpers from "@nomicfoundation/hardhat-toolbox/network-helpers";

const main = async () => {
  const USDCAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  const UNISwapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const USDCImpersonatingAddr = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  const impersonatedSigner = await ethers.getImpersonatedSigner(USDCImpersonatingAddr);

  const amountUSDC = ethers.parseUnits("5000", 6);
  const amountDAI = ethers.parseUnits("5000", 18);

  const USDC = await ethers.getContractAt("IERC20Token", USDCAddr);
  const DAI = await ethers.getContractAt("IERC20Token", DAIAddr);

  const ROUTER = await ethers.getContractAt("IUniswap", UNISwapRouter);

  const approveTxUSDC = await USDC.connect(impersonatedSigner).approve(
    UNISwapRouter,
    amountUSDC
  );
  await approveTxUSDC.wait();

  const approveTxDAI = await DAI.connect(impersonatedSigner).approve(
    UNISwapRouter,
    amountDAI
  );
  await approveTxDAI.wait();

  const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
  const daiBal = await DAI.balanceOf(impersonatedSigner.address);

  console.log("USDC Balance before add LIQUIDITY:", ethers.formatUnits(usdcBal, 6));
  console.log("DAI Balance before add LIQUIDITY:", ethers.formatUnits(daiBal, 18));

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const liquidityTx = await ROUTER.connect(impersonatedSigner).addLiquidity(
    USDCAddr,
    DAIAddr,
    amountUSDC,
    amountDAI,
    0, // min amount of liquidity tokens to receive (set to 0)
    0, // min amount of ETH to receive (set to 0)
    impersonatedSigner.address,
    deadline
  );
  
  await liquidityTx.wait();

  const usdcBalAfterLiquidity = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfterLiquidity = await DAI.balanceOf(impersonatedSigner.address);

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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
