import Link from 'next/link';

export default function Home() {
  return (
    <main className="main">
      <div className="container">
        <h1 className="title">HAOS</h1>
        <p className="subtitle">Home Automation Operating System</p>
        <div className="status">
          <span className="status-dot"></span>
          <span>System Online</span>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Components</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link 
              href="/discord-chat-test" 
              className="btn btn-primary"
              style={{ display: 'inline-block' }}
            >
              🎮 Discord-Style Chat Interface
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
