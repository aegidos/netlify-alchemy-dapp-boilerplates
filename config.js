import { createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { curtis } from 'viem/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [curtis],
  [publicProvider()]
);

// Create wagmi config
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});