import styles from "../styles/Home.module.css";
import { useRouter } from 'next/router';

const apeGangStory = (
  <>
    <p>Hey Bro, Hey Gangsters, was geht - check das ab – die Story der <strong>Ape Gang Stadtaffen</strong>! 🦍🔥</p>
    
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
      <li>🌃 <strong>Wir sind das neue GTA</strong></li>
    </ul>
    
    <p>Hier gibt's nur <strong>eins</strong>: Wer's von hier nach oben schafft, <strong>wird zur Legende</strong>. 💥🚀</p>
    
    <p>🔥 <strong>Ape Gang Stadtaffen – We run the streets!</strong> 🔥</p>
  </>
);

export default function Home() {
  const router = useRouter();

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
          {/* ...existing social links... */}
        </div>
      </main>
    </div>
  );
}
