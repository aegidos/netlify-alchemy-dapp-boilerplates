import styles from "../styles/Home.module.css";

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
      </main>
    </div>
  );
}
