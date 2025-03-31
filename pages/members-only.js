import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function MembersOnly() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log('Current wallet address:', address); // Debug log
  }, [address]); // Add address to dependencies

  useEffect(() => {
    if (isClient && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isClient, router]);

  useEffect(() => {
    console.log('Member page mounted, wallet state:', {
      address,
      isConnected,
      iframeUrl: `/games/ape-game/index.html?wallet=${address || ''}`
    });
  }, [address, isConnected]);

  if (!isClient) return null;

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      color: '#a0a0a0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <h1>Members Only Content</h1>
      <p>Current Wallet: {address || 'Not connected'}</p> {/* Add this line to verify address */}
      <div style={{
        width: '900px',
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        <iframe
          key={address} // Add this to force iframe reload when address changes
          src={`/games/ape-game/index.html?wallet=${address || ''}`}
          style={{
            width: '100%',
            height: '1800px',
            border: 'none',
            marginTop: '2rem',
            backgroundColor: '#000'
          }}
          onLoad={() => console.log('iframe loaded with address:', address)}
        />
      </div>
    </div>
  );
}

export default MembersOnly;