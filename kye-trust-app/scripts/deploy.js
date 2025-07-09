
async function main() {
  const hre = require("hardhat");
  const fs = require("fs");
  const path = require("path");

  const KyeTrustFactory = await hre.ethers.getContractFactory("KyeTrustFactory");
  const kyeTrustFactory = await KyeTrustFactory.deploy();

  await kyeTrustFactory.waitForDeployment();

  const address = await kyeTrustFactory.getAddress();
  console.log(`KyeTrustFactory deployed to: ${address}`);

  const contractsDir = path.join(__dirname, "..", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ KyeTrustFactory: address }, undefined, 2)
  );

  const factoryArtifact = hre.artifacts.readArtifactSync("KyeTrustFactory");
  fs.writeFileSync(
    path.join(contractsDir, "KyeTrustFactory.json"),
    JSON.stringify(factoryArtifact, null, 2)
  );

  const kyeTrustArtifact = hre.artifacts.readArtifactSync("KyeTrust");
  fs.writeFileSync(
    path.join(contractsDir, "KyeTrust.json"),
    JSON.stringify(kyeTrustArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
