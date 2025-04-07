import styles from "../styles/Home.module.css";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

const translations = {
  de: (
    <>
      🦍 Planet der Ape Gang – Überleben, Entwickeln, Erobern! 🌍🚀
      <p>Yo Gang, macht euch bereit – das ist der **Planet der Ape Gang**! 🦍🔥</p> 
      <p>Gestrandet auf einem wilden Planeten muss die **Ape Gang** ums Überleben kämpfen – gegen gnadenlose Alien-Spezies und unaufhaltsame Naturkatastrophen wie Meteoriteneinschläge, Vulkanausbrüche und gewaltige Überschwemmungen. 💥🌋🌊</p>
       <p>Die **Ape Gang Apes** müssen sich durchschlagen: 
        <li>🍌 **Nahrung sammeln**, um zu überleben </li>
        <li>💪 **Sich Runde für Runde trainieren und weiterentwickeln** </li>
        <li>🗺️ **Den Planeten erkunden**, um Geheimnisse zu lüften </li>
        <li>⚔️ **Feinde bekämpfen**, um ihr Territorium zu verteidigen </li>
        <li> 🧬 **Sich fortpflanzen**, um die nächste Generation zu sichern</li>
        </p> 
        <p>Nur die Stärksten passen sich an und führen die Ape Gang zur Dominanz! Ein rundenbasiertes Multiplayer-Game, in dem Strategie und Skill entscheiden, wer überlebt und wer untergeht. 🏆🔥</p> <p>🐵 **Planet der Ape Gang – Macht euch bereit für den ultimativen Kampf!** 🚀🔥</p>
    </>
  ),
  en: (
    <>
    🦍 Planet of the Ape Gang – Survive, Evolve, Conquer! 🌍🚀
<p>Yo Gang, get ready – this is the **Planet of the Ape Gang**! 🦍🔥</p> 
<p>Stranded on an untamed planet, the **Ape Gang** must fight to survive against 
  ruthless alien species and unstoppable natural disasters like meteor strikes, v
  olcanic eruptions, and massive floods. 💥🌋🌊</p> 
  <p>**Ape Gang Apes** need to hustle: 
  <li>🍌 **Gather food** to stay strong</li> 
  <li>💪 **Train and evolve** round by round</li>
  <li>🗺️ **Explore new territories** to uncover secrets</li>
  <li>⚔️ **Battle enemies** to defend their kind</li> 
  <li>🧬 **Reproduce and grow the tribe** for the future</li></p> <p>Survival is the name of the game – only the strongest will adapt and lead the Ape Gang to dominance! A round-based multiplayer experience where strategy and skill determine who thrives and who falls. 🏆🔥</p> <p>🐵 **Planet of the Ape Gang – Get Ready for the Ultimate Battle!** 🚀🔥</p>
This keeps the hype and energy of the original but aligns it with your new game concept! Let me know if you want any tweaks. 🚀









    </>
  )
};

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState('de');
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

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
        {!isConnected && (
          <button 
            onClick={() => connect()}
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
          <a href="https://opensea.io/collection/apegang-ape" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ opacity: 0.7, transition: 'opacity 0.2s' }}
             onMouseOver={(e) => e.currentTarget.style.opacity = 1}
             onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
          >
            <img src="/images/opensea.svg" alt="OpenSea" width="40" height="40" />
          </a>
          <a href="https://magiceden.io/collections/apechain/0xf36f4fadef899e839461eccb8d0ce3d49cff5a90" 
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
