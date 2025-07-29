# 投票 DApp

这是一个使用 Solidity、Hardhat、React 和 ethers.js 构建的去中心化投票应用 (dApp)。

## 项目结构

-   `contracts/`: 存放 Solidity 智能合约 (`Voting.sol`)。
-   `scripts/`: 智能合约的部署脚本。
-   `src/`: 前端 React 应用。
-   `hardhat.config.cjs`: Hardhat 配置文件。

## 开发

### 环境要求

-   Node.js (推荐使用 pnpm)
-   安装了钱包插件（如 MetaMask）的浏览器。

### 安装

1.  克隆本仓库。
2.  安装依赖：
    ```bash
    pnpm install
    ```

### 运行项目

1.  启动本地 Hardhat 节点：
    ```bash
    npx hardhat node
    ```
2.  将合约部署到本地节点：
    ```bash
    npx hardhat run scripts/deploy.cjs --network localhost
    ```
3.  启动前端应用：
    ```bash
    pnpm run dev
    ```
4.  打开浏览器，并将你的钱包（例如 MetaMask）连接到本地 Hardhat 网络。