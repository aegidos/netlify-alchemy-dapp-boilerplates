import styles from "../styles/Home.module.css";

const apeGangStory = (
  <>
    <p>Hey Bro, was geht ab check das ab – die Story von den <strong>Ape Gang Stadtaffen</strong>! 🦍🔥</p>
    
    <p>Vergiss Yachten, vergiss Golf Clubs – <strong>wir sind die Straßen, wir sind die Zukunft!</strong></p>
    
    <p>
      Die <strong>Ape Gang</strong> is' ne neue Generation von Affen – <strong>wilder, dreckiger, hungriger</strong>. 
      Die Kiddies der Bored Apes, aber wir könnens uns nicht leisten reich zu chillen Bro, ham wir Hunger auf die Hood. 
      Straßen, Blocks, Nachtleben – unser Playground. Wir erkämpfen uns unsern Status.
    </p>
    
    <p><strong>Was fürn Yachtclub? Wir brauchen'n Kiez, 'ne Hood, 'nen legendären Treffpunkt, wo die Gang sich sammelt.</strong></p>
    
    <ul>
      <li>🚧 <strong>Ghetto mit Neonlichtern statt Villen mit Pools</strong></li>
      <li>🎨 <strong>Graffiti an den Wänden, Hip-Hop aus den Boxen</strong></li>
      <li>🏢 <strong>Chillen im Loft</strong></li>
      <li>🏎️ <strong>Wetten auf Straßenrennen, fette Drip, Urban Jungle</strong></li>
      <li>🌃 <strong>Web3-Berlin Neukölln trifft GTA</strong></li>
    </ul>
    
    <p>Hier gibt's nur <strong>eins</strong>: Wer's von hier nach oben schafft, <strong>wird zur Legende</strong>. 💥🚀</p>
    
    <p>🔥 <strong>Ape Gang Stadtaffen – We run the streets!</strong> 🔥</p>
  </>
);

export default function Home() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <main className={styles.main}>
        <img 
          src="/00035-96663071.png" 
          alt="Main Image"
          style={{
            maxWidth: '100%',
            height: 'auto',
            marginTop: 0,
            display: 'block'
          }}
        />
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
          {apeGangStory}
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
