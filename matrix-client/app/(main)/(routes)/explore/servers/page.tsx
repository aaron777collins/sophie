'use client';

import dynamic from 'next/dynamic';

const ServerDiscovery = dynamic(
  () => import('@/components/servers/server-discovery').then(mod => mod.ServerDiscovery),
  { ssr: false }
);

export default function ExploreServersPage() {
  return (
    <div className="explore-servers-page">
      <ServerDiscovery />
    </div>
  );
}