import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: '42px',
        }}
      >
        {/* Wallet icon — two rectangles */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* Card body */}
          <div
            style={{
              width: '110px',
              height: '76px',
              background: 'rgba(255,255,255,0.25)',
              borderRadius: '14px',
              border: '4px solid rgba(255,255,255,0.7)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              padding: '10px 12px',
              gap: '8px',
            }}
          >
            {/* Chip */}
            <div
              style={{
                width: '28px',
                height: '20px',
                background: 'rgba(255,255,255,0.85)',
                borderRadius: '4px',
              }}
            />
            {/* Stripe */}
            <div
              style={{
                width: '80px',
                height: '8px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '4px',
              }}
            />
          </div>
          {/* "F" lettermark below */}
          <div
            style={{
              color: 'white',
              fontSize: '40px',
              fontWeight: '800',
              fontFamily: 'sans-serif',
              lineHeight: 1,
              letterSpacing: '-2px',
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
