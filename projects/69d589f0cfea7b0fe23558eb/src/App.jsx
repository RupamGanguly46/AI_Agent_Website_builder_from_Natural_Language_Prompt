function App() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem',
                }}>
                    AI Website Builder
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
                    Template Running Successfully ✨
                </p>
            </div>
        </div>
    );
}

export default App;
