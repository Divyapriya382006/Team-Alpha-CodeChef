import { useEffect, useState } from 'react';

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'boot' | 'reveal' | 'exit'>('boot');
  const [dotsCount, setDotsCount] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDotsCount(d => (d + 1) % 4);
    }, 180);

    // Animate progress bar
    const barInterval = setInterval(() => {
      setBarWidth(w => {
        if (w >= 100) { clearInterval(barInterval); return 100; }
        return w + Math.random() * 18;
      });
    }, 120);

    // Phase transitions
    const revealTimer = setTimeout(() => setPhase('reveal'), 900);
    const exitTimer = setTimeout(() => setPhase('exit'), 1500);
    const doneTimer = setTimeout(() => onDone(), 1900);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(barInterval);
      clearTimeout(revealTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  const dots = '.'.repeat(dotsCount);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0A0A0A',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: phase === 'exit' ? 'opacity 0.4s ease-out, transform 0.4s ease-out' : 'none',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'translateY(-12px)' : 'translateY(0)',
        padding: '32px',
      }}
    >
      {/* Top-left VIT tag */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <span style={{
          backgroundColor: '#C8F135',
          color: '#0A0A0A',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 700,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '2px 8px',
          border: '1.5px solid #C8F135',
          borderRadius: 0,
          display: 'inline-block',
          width: 'fit-content',
        }}>
          VIT Chennai
        </span>
        <span style={{
          color: '#555555',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: '0.05em',
        }}>
          EST. 2001
        </span>
      </div>

      {/* Top-right system info */}
      <div style={{
        position: 'absolute',
        top: 24,
        right: 28,
        textAlign: 'right',
      }}>
        <p style={{
          color: '#333333',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          margin: 0,
          letterSpacing: '0.04em',
        }}>
          SYS_BOOT v2.0.1
        </p>
        <p style={{
          color: '#333333',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          margin: '2px 0 0',
        }}>
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
        </p>
      </div>

      {/* Main wordmark */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        {/* Big square accent */}
        <div style={{
          width: 20,
          height: 20,
          backgroundColor: '#C8F135',
          border: '2px solid #C8F135',
          display: 'inline-block',
          marginBottom: 20,
          marginRight: 12,
          verticalAlign: 'middle',
        }} />
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          verticalAlign: 'middle',
        }}>
          CAMPUS
        </span>
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          color: '#C8F135',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          verticalAlign: 'middle',
        }}>
          OS
        </span>

        {/* Tagline */}
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 500,
          fontSize: 13,
          color: '#555555',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginTop: 16,
          marginBottom: 0,
        }}>
          Student Community Platform
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        marginBottom: 16,
      }}>
        <div style={{
          width: '100%',
          height: 3,
          backgroundColor: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: 0,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(barWidth, 100)}%`,
            backgroundColor: '#C8F135',
            transition: 'width 0.1s ease-out',
          }} />
        </div>
      </div>

      {/* Boot text */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: '#444444',
          letterSpacing: '0.04em',
        }}>
          {phase === 'boot'
            ? `INITIALIZING${dots}`
            : phase === 'reveal'
            ? 'READY.'
            : 'LAUNCHING...'}
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: '#C8F135',
        }}>
          {Math.min(Math.round(barWidth), 100)}%
        </span>
      </div>

      {/* Bottom strip */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#C8F135',
      }} />
    </div>
  );
}
