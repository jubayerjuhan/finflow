import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#3b82f6',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Card body */}
          <div
            style={{
              width: '100px',
              height: '70px',
              background: 'rgba(255,255,255,0.25)',
              borderRadius: '12px',
              border: '3.5px solid rgba(255,255,255,0.75)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              padding: '9px 10px',
              gap: '7px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '18px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '3px',
              }}
            />
            <div
              style={{
                width: '72px',
                height: '7px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '3px',
              }}
            />
          </div>
          <div
            style={{
              color: 'white',
              fontSize: '34px',
              fontWeight: '800',
              fontFamily: 'sans-serif',
              lineHeight: 1,
              letterSpacing: '-1.5px',
            }}
          >
            FinFlow
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
