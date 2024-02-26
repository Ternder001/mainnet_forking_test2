import { ethers } from "hardhat";
import helpers from "@nomicfoundation/hardhat-toolbox/network-helpers";

const main = async () => {
  const USDCAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  const UNISwapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const USDCImpersonatingAddr = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  const impersonatedSigner = await ethers.getImpersonatedSigner(USDCImpersonatingAddr);

  const amountOut = ethers.parseUnits("7000", 6);
  const amountIn = ethers.parseEther("1");

  const USDC = await ethers.getContractAt("IERC20Token", USDCAddr);
  const DAI = await ethers.getContractAt("IERC20Token", DAIAddr);

  const ROUTER = await ethers.getContractAt("IUniswap", UNISwapRouter);

  const approveTx = await USDC.connect(impersonatedSigner).approve(
    UNISwapRouter,
    amountOut
  );
  await approveTx.wait();


  const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
  const daiBal = await DAI.balanceOf(impersonatedSigner.address);

  console.log("USDC Balance:", ethers.formatUnits(usdcBal, 6));
  console.log("DAI Balance:", ethers.formatUnits(daiBal, 18));

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // const swapTx = await ROUTER.swapTokensForExactETH(
  //     amountOut,
  //     amountIn,
  //     [USDCAddress, wethAdress],
  //     impersonatedSigner.address,
  //     deadline
  // );

  const swapTx = await ROUTER.connect(
    impersonatedSigner
  ).swapExactTokensForTokens(
    amountOut,
    0,
    [USDCAddr, DAIAddr],
    impersonatedSigner.address,
    deadline
  );

  await swapTx.wait();

  // Uncomment this if you are using the swap tokens for ETH
  // const ethBalAfterSwap = await impersonatedSigner.provider.getBalance(USDCHolder);
  // const wethBalAfterSwap = await WETH.balanceOf(impersonatedSigner.address);

  const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
  const daiBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);

  console.log(
    "--------------------------------------------------"
  );

  // Uncomment this if you are using the swap tokens for ETH
  // console.log("weth balance before swap", ethers.formatUnits(wethBalAfterSwap, 18));
  // console.log("eth balance after swap", ethers.formatUnits(ethBalAfterSwap, 18));

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