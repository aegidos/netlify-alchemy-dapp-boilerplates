import { useEffect, useState } from 'react';

function GamePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      color: '#a0a0a0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'black'
    }}>
      <h1>Ape Game</h1>
      <div style={{
        width: '800px',
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        <iframe
          src="/games/ape-game/index.html"
          style={{
            width: '100%',
            height: '600px',
            border: 'none',
            marginTop: '2rem',
            backgroundColor: '#000'
          }}
        />
      </div>
    </div>
  );
}

export default GamePage;