import styles from "../styles/Home.module.css";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

const translations = {
  en: (
    <>
      <h1>Apes in Space</h1>
      <p>Have you ever asked yourself how all the apes came to our space? Legend has it they arrived aboard a massive, interstellar vessel—an enterprise-sized shuttle—crashing through the atmosphere and landing on a wild, untamed planet. From that moment on, they were no longer just passengers. They became survivors. Competitors. Explorers.</p>
      <p>Forced to contend with the planet's volatile environment and rival species, the apes began adapting rapidly. Driven by the need to endure, evolve, and thrive, they entered a relentless cycle of survival and conquest.</p>

      <h2>The Game: Survival in Rounds</h2>
      <p>Apes in Space is a round-based multiplayer game that fuses strategy, skill, and a touch of cosmic luck. In each round, players must:</p>
      <ul>
        <li>🌿 Gather rare resources to maintain strength and vitality</li>
        <li>⚔️ Defend against threats—alien creatures, cataclysmic events, and other ape factions</li>
        <li>🚀 Explore new biomes, uncovering secrets and unlocking power-ups</li>
        <li>💪 Evolve, enhancing abilities and expanding the ape tribe</li>
      </ul>
      <p>Only the most strategic and resilient players will advance through the escalating rounds of intensity.</p>

      <h2>Fuel Your Journey with Rare Plants</h2>
      <p>To survive and grow stronger, apes must consume energy-rich, native flora unique to the alien world. These include:</p>
      <ul>
        <li>🍄 Hushrooms (Max 150)</li>
        <li>🌿 Firegrass (Max 600)</li>
        <li>💩 Stinkballs (Max 1000)</li>
        <li>🍃 Blueleafs (Max 1000)</li>
        <li>🌱 Snakeroots (Max 1300)</li>
        <li>🔴 Rangones (Max 800)</li>
      </ul>
      <p>Each plant type varies in availability and energy value. Collecting and managing these resources is key to long-term survival and progression.</p>

      <h2>Play to Earn: Free NFTs</h2>
      <p>Progress unlocks rewards. Players receive free NFTs as they advance through specific rounds of the game.</p>
      <p>Earn 1 NFT upon reaching the Ranking after each round 1, 2, 3, 4, ... and beyond (up to 12 free mints).</p>

      <h2>Brew Elixirs</h2>
      <p>The planet's native plants are more than just food—they hold mystical properties.</p>
      <p>Players will be able to harvest and store these plants in their inventory for a powerful upcoming feature:</p>
      <p>🌟 Brew Elixir – a contract-based function that allows players to burn 2 or 3 plant NFTs in exchange for a powerful elixir NFT.</p>
      <p>Four distinct elixir types are available:</p>
      <ul>
        <li>🧪 Magic Mana & Cure Elixir</li>
        <li>🔷 Mana</li>
        <li>💚 Cure 25%</li>
        <li>💜 Cure 50%</li>
      </ul>
      <p>These elixirs will grant strategic advantages in upcoming game modes and possibly unlock exclusive in-game content.</p>
    </>
  ),
  de: (
    <>
      <h1>Affen im Weltraum</h1>
      <p>Haben Sie sich jemals gefragt, wie all die Affen in unseren Weltraum kamen? Die Legende besagt, dass sie an Bord eines riesigen, interstellaren Schiffes ankamen - eines Shuttles in Enterprise-Größe - das durch die Atmosphäre krachte und auf einem wilden, ungezähmten Planeten landete. Von diesem Moment an waren sie nicht mehr nur Passagiere. Sie wurden zu Überlebenden. Zu Wettkämpfern. Zu Entdeckern.</p>
      <p>Gezwungen, sich mit der instabilen Umgebung des Planeten und rivalisierenden Arten auseinanderzusetzen, begannen die Affen, sich schnell anzupassen. Getrieben von der Notwendigkeit zu überleben, sich weiterzuentwickeln und zu gedeihen, traten sie in einen unerbittlichen Zyklus des Überlebens und der Eroberung ein.</p>

      <h2>Das Spiel: Überleben in Runden</h2>
      <p>Apes in Space ist ein rundenbasiertes Multiplayer-Spiel, das Strategie, Geschicklichkeit und einen Hauch kosmischen Glücks vereint. In jeder Runde müssen die Spieler:</p>
      <ul>
        <li>🌿 Seltene Ressourcen sammeln, um Kraft und Vitalität zu erhalten</li>
        <li>⚔️ Sich gegen Bedrohungen verteidigen - außerirdische Kreaturen, katastrophale Ereignisse und andere Affenfraktionen</li>
        <li>🚀 Neue Biome erkunden, Geheimnisse aufdecken und Power-ups freischalten</li>
        <li>💪 Sich weiterentwickeln, Fähigkeiten verbessern und den Affenstamm erweitern</li>
      </ul>
      <p>Nur die strategischsten und widerstandsfähigsten Spieler werden durch die sich steigernden Runden der Intensität vorankommen.</p>

      <h2>Treibstoff für deine Reise mit seltenen Pflanzen</h2>
      <p>Um zu überleben und stärker zu werden, müssen Affen energiereiche, einheimische Flora konsumieren, die einzigartig für die außerirdische Welt ist. Dazu gehören:</p>
      <ul>
        <li>🍄 Hushrooms (Max 150)</li>
        <li>🌿 Feuergras (Max 600)</li>
        <li>💩 Stinkbälle (Max 1000)</li>
        <li>🍃 Blaublätter (Max 1000)</li>
        <li>🌱 Schlangenwurzeln (Max 1300)</li>
        <li>🔴 Rangonen (Max 800)</li>
      </ul>
      <p>Jede Pflanzenart variiert in Verfügbarkeit und Energiewert. Das Sammeln und Verwalten dieser Ressourcen ist der Schlüssel zum langfristigen Überleben und Fortschritt.</p>

      <h2>Spielen zum Verdienen: Kostenlose NFTs</h2>
      <p>Fortschritt schaltet Belohnungen frei. Spieler erhalten kostenlose NFTs, wenn sie bestimmte Runden des Spiels erreichen.</p>
      <p>Verdiene 1 NFT beim Erreichen des Rankings nach jeder Runde 1, 2, 3, 4, ... und darüber hinaus (bis zu 12 kostenlose Prägungen).</p>

      <h2>Elixiere brauen</h2>
      <p>Die einheimischen Pflanzen des Planeten sind mehr als nur Nahrung - sie besitzen mystische Eigenschaften.</p>
      <p>Spieler können diese Pflanzen ernten und in ihrem Inventar für eine mächtige kommende Funktion aufbewahren:</p>
      <p>🌟 Elixier brauen – eine vertragsbasierte Funktion, die es Spielern ermöglicht, 2 oder 3 Pflanzen-NFTs gegen ein mächtiges Elixier-NFT einzutauschen.</p>
      <p>Vier verschiedene Elixiertypen sind verfügbar:</p>
      <ul>
        <li>🧪 Magisches Mana & Heilungselixier</li>
        <li>🔷 Mana</li>
        <li>💚 Heilung 25%</li>
        <li>💜 Heilung 50%</li>
      </ul>
      <p>Diese Elixiere gewähren strategische Vorteile in kommenden Spielmodi und schalten möglicherweise exklusive Spielinhalte frei.</p>
    </>
  )
};

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState('en'); // Change default to 'en'
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConnect = async () => {
    try {
      // Clear any existing connections
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.connected');
      localStorage.removeItem('wagmi.cache');
      
      await connect();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  useEffect(() => {
    const gameFrame = document.getElementById('qpop');
    if (gameFrame && gameFrame.contentWindow) {
      const passProvidersToGame = () => {
        try {
          gameFrame.contentWindow.ethers = window.ethersLib;
          gameFrame.contentWindow.ethereum = window.ethereum;
          gameFrame.contentWindow.gameConfig = {
            walletAddress: address,
            isConnected: isConnected
          };
        } catch (err) {
          console.error('Error passing providers to game:', err);
        }
      };

      gameFrame.addEventListener('load', passProvidersToGame);
      passProvidersToGame();

      return () => gameFrame.removeEventListener('load', passProvidersToGame);
    }
  }, [address, isConnected]);

  return (
    <div style={{ overflow: 'hidden' }}>
      <main className={styles.main}>
        <img 
          src="/00027-apechain.png" 
          alt="Main Image"
          style={{
            maxWidth: '100%',
            height: 'auto',
            marginTop: 0,
            display: 'block'
          }}
        />
        
        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(lang => lang === 'de' ? 'en' : 'de')}
          style={{
            background: 'none',
            border: '1px solid #a0a0a0',
            color: '#a0a0a0',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            marginTop: '1rem',
            fontFamily: 'monospace',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#a0a0a0';
            e.currentTarget.style.color = '#000';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#a0a0a0';
          }}
        >
          {language.toUpperCase()}
        </button>

        <div style={{
          color: '#a0a0a0',
          maxWidth: '800px',
          margin: '2rem auto',
          padding: '0 1rem',
          textAlign: 'left',
          fontFamily: 'monospace',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          {translations[language]}
        </div>
        
        {/* Add Connect Wallet button if needed */}
        {!isConnected && isClient && (
          <button 
            onClick={handleConnect}
            style={{
              background: 'none',
              border: '1px solid #a0a0a0',
              color: '#a0a0a0',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Connect Wallet
          </button>
        )}

        {/* <iframe
          id="qpop"
          src="/games/ape-game/index.html"
          style={{ width: '100%', height: '600px', border: 'none' }}
          allow="web3"
          sandbox="allow-scripts allow-same-origin allow-popups allow-modals"
        /> */}
        
        {/* Social Links */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          padding: '2rem 0',
          width: '100%'
        }}>
          <a href="https://opensea.io/collection/apes-in-space-on-ape" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ opacity: 0.7, transition: 'opacity 0.2s' }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            <img src="/images/opensea.svg" alt="OpenSea" width="40" height="40" />
          </a>
          <a href="https://magiceden.io/collections/apechain/0x223a0d58e50bb9c03261fc34dd271a9eaf1ffb6d" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ 
               opacity: 0.7, 
               transition: 'opacity 0.2s',
               textDecoration: 'none',
               color: '#a0a0a0',
               fontSize: '24px',
               fontFamily: 'monospace',
               fontWeight: 'bold',
               display: 'flex',
               alignItems: 'center',
               height: '40px'
             }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            M∑
          </a>
          <a href="https://x.com/aegidos" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ opacity: 0.7, transition: 'opacity 0.2s' }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            <img src="/images/x-logo.svg" alt="X (Twitter)" width="40" height="40" />
          </a>
          <a href="https://www.threads.net/andischmid1210" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ opacity: 0.7, transition: 'opacity 0.2s' }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            <img src="/images/threads.svg" alt="Threads" width="40" height="40" />
          </a>
        </div>
      </main>
    </div>
  );
}
