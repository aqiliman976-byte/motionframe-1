export const STARTER_COMPOSITION = `import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence
} from 'remotion';

export const MotionGraphic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Scene 1: Intro Kinetic Typography (0 - 60 frames)
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 }
  });

  const titleScale = interpolate(introSpring, [0, 1], [0.8, 1]);
  const titleOpacity = interpolate(introSpring, [0, 1], [0, 1]);
  const badgeTranslateY = interpolate(introSpring, [0, 1], [30, 0]);

  // Scene 2: 3 Floating Feature Cards (45 - 120 frames)
  const card1Spring = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 120 }
  });
  const card2Spring = spring({
    frame: frame - 52,
    fps,
    config: { damping: 12, stiffness: 120 }
  });
  const card3Spring = spring({
    frame: frame - 64,
    fps,
    config: { damping: 12, stiffness: 120 }
  });

  // Scene 3: Climax & CTA (110 - 180 frames)
  const climaxSpring = spring({
    frame: frame - 110,
    fps,
    config: { damping: 15, stiffness: 90 }
  });

  const ringRotation = interpolate(frame, [0, 180], [0, 120]);
  const ringScale = interpolate(climaxSpring, [0, 1], [0.6, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F5F8FF',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: '#172B4D',
      }}
    >
      {/* Background Subtle Geometric Circles */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          border: '1.5px solid #DCE6F3',
          transform: \`rotate(\${ringRotation}deg) scale(\${ringScale})\`,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: '1px dashed #A9C9FF',
          transform: \`rotate(\${-ringRotation * 1.5}deg)\`,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      {/* SCENE 1: Brand Introduction */}
      <Sequence from={0} durationInFrames={75}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: \`scale(\${titleScale})\`,
            opacity: titleOpacity,
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          <div
            style={{
              backgroundColor: '#E8F1FF',
              color: '#477DCC',
              padding: '8px 20px',
              borderRadius: 30,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 24,
              border: '1px solid #A9C9FF',
              transform: \`translateY(\${badgeTranslateY}px)\`,
            }}
          >
            Motio AI Generated
          </div>

          <h1
            style={{
              fontSize: 68,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: 0,
              color: '#172B4D',
            }}
          >
            MotionFrame <span style={{ color: '#477DCC' }}>Studio</span>
          </h1>

          <p
            style={{
              fontSize: 22,
              color: '#718096',
              maxWidth: 620,
              marginTop: 18,
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Turn generative code into crisp, high-framerate motion graphics and production MP4s.
          </p>
        </div>
      </Sequence>

      {/* SCENE 2: Floating Cards Showcase */}
      <Sequence from={60} durationInFrames={70}>
        <div
          style={{
            display: 'flex',
            gap: 28,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 1040,
            padding: '0 40px',
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: '36px 28px',
              border: '1px solid #DCE6F3',
              boxShadow: '0 12px 36px rgba(71, 125, 204, 0.08)',
              transform: \`translateY(\${interpolate(card1Spring, [0, 1], [60, 0])}px) scale(\${interpolate(card1Spring, [0, 1], [0.85, 1])})\`,
              opacity: interpolate(card1Spring, [0, 1], [0, 1]),
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#E8F1FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#477DCC',
                marginBottom: 20,
                fontWeight: 700,
              }}
            >
              01
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px 0', color: '#172B4D' }}>
              Paste Motio TSX
            </h3>
            <p style={{ fontSize: 15, color: '#718096', lineHeight: 1.5, margin: 0 }}>
              Seamless contract validation with instant visual feedback.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: '36px 28px',
              border: '1.5px solid #A9C9FF',
              boxShadow: '0 18px 48px rgba(71, 125, 204, 0.12)',
              transform: \`translateY(\${interpolate(card2Spring, [0, 1], [60, 0])}px) scale(\${interpolate(card2Spring, [0, 1], [0.85, 1])})\`,
              opacity: interpolate(card2Spring, [0, 1], [0, 1]),
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#477DCC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#FFFFFF',
                marginBottom: 20,
                fontWeight: 700,
              }}
            >
              02
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px 0', color: '#172B4D' }}>
              60 FPS Preview
            </h3>
            <p style={{ fontSize: 15, color: '#718096', lineHeight: 1.5, margin: 0 }}>
              Hardware-accelerated live scrubbing and real-time inspector.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: '36px 28px',
              border: '1px solid #DCE6F3',
              boxShadow: '0 12px 36px rgba(71, 125, 204, 0.08)',
              transform: \`translateY(\${interpolate(card3Spring, [0, 1], [60, 0])}px) scale(\${interpolate(card3Spring, [0, 1], [0.85, 1])})\`,
              opacity: interpolate(card3Spring, [0, 1], [0, 1]),
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#E8F1FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#477DCC',
                marginBottom: 20,
                fontWeight: 700,
              }}
            >
              03
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px 0', color: '#172B4D' }}>
              Render to MP4
            </h3>
            <p style={{ fontSize: 15, color: '#718096', lineHeight: 1.5, margin: 0 }}>
              True server-side Remotion renderer pipeline with SSE progress.
            </p>
          </div>
        </div>
      </Sequence>

      {/* SCENE 3: Climax & Call to Action */}
      <Sequence from={115} durationInFrames={65}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            transform: \`scale(\${interpolate(climaxSpring, [0, 1], [0.8, 1])})\`,
            opacity: interpolate(climaxSpring, [0, 1], [0, 1]),
            padding: '0 40px',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #477DCC 0%, #A9C9FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(71, 125, 204, 0.25)',
              marginBottom: 28,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>

          <h2
            style={{
              fontSize: 54,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0',
              color: '#172B4D',
            }}
          >
            Ready to Render.
          </h2>

          <p
            style={{
              fontSize: 20,
              color: '#718096',
              maxWidth: 500,
              margin: '0 0 32px 0',
              lineHeight: 1.5,
            }}
          >
            Export clean, artifact-free MP4s at your chosen aspect ratio and resolution.
          </p>

          <div
            style={{
              backgroundColor: '#477DCC',
              color: '#FFFFFF',
              padding: '14px 36px',
              borderRadius: 14,
              fontSize: 18,
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(71, 125, 204, 0.3)',
            }}
          >
            MotionFrame Studio v1.0
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
`;
