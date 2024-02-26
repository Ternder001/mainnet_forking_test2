import { ethers } from "hardhat";

const main = async () => {
  const USDCAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const wethAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const UNISwapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const USDCImpersonatingAddr = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  const impersonatedSigner = await ethers.getSigner(USDCImpersonatingAddr);

  const amountOut = ethers.parseEther("1"); // Amount of ETH we want to receive
  const amountInMax = ethers.parseUnits("2000", 6); // Maximum amount of USDC to spend

  const USDC = await ethers.getContractAt("IERC20", USDCAddr);
  const WETH = await ethers.getContractAt("IERC20", wethAddr);
  const ROUTER = await ethers.getContractAt("IUniswap", UNISwapRouter);

  // Approve the Uniswap Router to spend USDC
  await USDC.connect(impersonatedSigner).approve(UNISwapRouter, amountInMax);

  // Define path for the swap
  const path = [USDCAddr, wethAddr];

  // Set deadline for the swap transaction
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // Perform the swap
  const swapTx = await ROUTER.connect(impersonatedSigner).swapExactTokensForETH(
    amountInMax,
    amountOut,
    path,
    impersonatedSigner.address,
    deadline
  );

  await swapTx.wait();

  // Print balances after the swap
  const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
  const wethBalAfterSwap = await WETH.balanceOf(impersonatedSigner.address);

  console.log("USDC balance after swap:", ethers.formatUnits(usdcBalAfterSwap, 6));
  console.log("WETH balance after swap:", ethers.formatEther(wethBalAfterSwap));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
