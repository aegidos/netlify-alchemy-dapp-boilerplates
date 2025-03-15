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
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Members Only Content</h1>
      <p>Welcome to the exclusive NFT holders area!</p>
    </div>
  );
}

export default MembersOnly;