import { ServerDiscovery } from '@/components/servers/server-discovery';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Servers - Matrix Client',
  description: 'Discover and join public Matrix servers that match your interests'
};

export default function ExploreServersPage() {
  return (
    <div className="explore-servers-page">
      <ServerDiscovery />
    </div>
  );
}