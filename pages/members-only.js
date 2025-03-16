import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function MembersOnly() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isClient, router]);

  if (!isClient) return null;

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      color: '#a0a0a0', // Light grey color for all text
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <h1>Members Only Content</h1>
      <p>Welcome to the exclusive NFT holders area!</p>
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

export default MembersOnly;