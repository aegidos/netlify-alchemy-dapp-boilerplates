import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import styles from "../../styles/Navbar.module.css";

export default function Navbar() {
  const { address, isConnected } = useAccount();

  // Store wallet address globally for use in ranking.js
  if (typeof window !== "undefined") {
    window.gameConfig = {
      walletAddress: address || "unknown",
      isConnected,
    };
  }

  return (
    <nav className={styles.navbar}>
      <img className={styles.alchemy_logo} src="/images/ApeChainApe.png" alt="ApeChain Logo" />
      <ConnectButton />
    </nav>
  );
}
