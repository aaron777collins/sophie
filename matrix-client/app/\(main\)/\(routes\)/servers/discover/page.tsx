import { PublicServerSearch } from '@/components/servers/public-server-search';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover Public Servers - Matrix Client',
  description: 'Find and join public Matrix servers based on your interests'
};

export default function DiscoverServersPage() {
  return (
    <div className="discover-servers-page">
      <PublicServerSearch />
    </div>
  );
}