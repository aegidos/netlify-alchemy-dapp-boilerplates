import styles from "../styles/Home.module.css";
import { useRouter } from 'next/router';
import { useState } from 'react';

const translations = {
  de: (
    <>
      <p>Hey Bro, Hey Gangsters, was geht - check das ab – die Story der <strong>Ape Gang</strong>! 🦍🔥</p>
      
      <p>Vergiss Yachten, vergiss Golf Clubs – <strong>wir feiern in den Clubs und Straßen, wir sind die Zukunft!</strong></p>
      
      <p>
        Die <strong>Ape Gang</strong> is' ne neue Generation von Affen – <strong>wilder, dreckiger, hungriger</strong>. 
        Die nächste Generation, aber wir können's uns nicht leisten reich zu chillen Bro. 
        Straßen, Blocks, Nachtleben – unser Playground. Wir erkämpfen uns was uns zusteht.
      </p>
      
      <p><strong>Was fürn Yachtclub? Wir brauchen'n Kiez, 'ne Hood, 'nen legendären Treffpunkt einen Space, wo die Gang sich sammelt.</strong></p>
      
      <ul>
        <li>🚧 <strong>Ghetto mit Neonlichtern statt Villen und Pools</strong></li>
        <li>🎨 <strong>Graffiti an den Wänden, Hip-Hop aus den Boxen</strong></li>
        <li>🏢 <strong>Chillen im Loft</strong></li>
        <li>🏎️ <strong>Wetten auf Straßenrennen, fette Cars, Urban Jungle</strong></li>
        <li>🌃 <strong>Wir sind das neue GTA in Ape City</strong></li>
      </ul>
      
      <p>Hier gibt's nur <strong>eins</strong>: Wer's von hier nach oben schafft, <strong>wird zur Legende</strong>. 💥🚀</p>
      
      <p>🔥 <strong>Ape Gang  – Willkommen in Ape City und auf zum ersten Quest!</strong> 🔥</p>
      <p>🔥 <strong>Quest 1:  – Verbinde dein Wallet und erobere im nächsten Game den Planeten Q</strong> 🔥</p>
    </>
  ),
  en: (
    <>
      <p>Yo Bro, Hey Gangsters, what's up - check this out – the story of the <strong>Ape Gang City Apes</strong>! 🦍🔥</p>
      
      <p>Forget yachts, forget golf clubs – <strong>we party in the clubs and streets, we are the future!</strong></p>
      
      <p>
        The <strong>Ape Gang</strong> is a new generation of apes – <strong>wilder, dirtier, hungrier</strong>. 
        The next generation, but we can't afford to chill rich Bro. 
        Streets, blocks, nightlife – our playground. We fight for what's ours.
      </p>
      
      <p><strong>What yacht club? We need a hood, a legendary meeting spot, a space where the gang comes together.</strong></p>
      
      <ul>
        <li>🚧 <strong>Ghetto with neon lights instead of villas and pools</strong></li>
        <li>🎨 <strong>Graffiti on the walls, hip-hop from the speakers</strong></li>
        <li>🏢 <strong>Chilling in the loft</strong></li>
        <li>🏎️ <strong>Betting on street races, sick cars, urban jungle</strong></li>
        <li>🌃 <strong>We are the new GTA</strong></li>
      </ul>
      
      <p>There's only <strong>one thing</strong>: Whoever makes it to the top <strong>becomes a legend</strong>. 💥🚀</p>
      
      <p>🔥 <strong>Ape Gang City Apes – Welcome to Ape City and let's start your first Quest!</strong> 🔥</p>
      <p>🔥 <strong>Quest 1:  – Connect your wallet and conquer planet Q</strong> 🔥</p>
    </>
  )
};

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState('de');

  return (
    <div style={{ overflow: 'hidden' }}>
      <main className={styles.main}>
        <img 
          src="/00027-2200268156.png" 
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
