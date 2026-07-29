import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

const fieldStyle = {
  width: '100%',
  height: 46,
  padding: '0 14px',
  border: `1px solid ${c.lineStrong}`,
  borderRadius: 10,
  fontSize: 14.5,
  color: c.ink,
  outline: 'none',
  background: 'rgba(255,255,255,.7)',
} as const

const labelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
  fontSize: 12.5,
  fontWeight: 500,
  color: c.textMuted,
}

/**
 * Login / signup popup. There's no real backend behind this prototype, so
 * submitting either form just closes the modal — it exists to show the flow.
 */
export function AuthModal() {
  const { authOpen, authMode, setAuthMode, closeAuth } = useApp()
  const isLogin = authMode === 'login'

  if (!authOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? 'Log in' : 'Create an account'}
      onClick={closeAuth}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(13,13,17,.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'csFadeIn .2s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(253,250,246,.82)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,.5)',
          borderRadius: 24,
          boxShadow: '0 40px 90px -40px rgba(13,13,17,.6)',
          padding: '28px 28px 26px',
          animation: 'csRise .3s ease both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ display: 'flex', color: c.primary }}>
                <Icon name="Person" size={19} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.3, color: c.primary }}>
                {isLogin ? 'Welcome back' : 'Create your account'}
              </span>
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: -0.5,
                lineHeight: 1.15,
                color: c.ink,
              }}
            >
              {isLogin ? 'Log in to ceylontrips' : 'Sign up for ceylontrips'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAuth}
            aria-label="Close"
            style={{
              flex: 'none',
              width: 34,
              height: 34,
              border: 'none',
              borderRadius: 9,
              background: 'rgba(0,0,0,.06)',
              color: c.body,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            padding: 4,
            borderRadius: 999,
            background: 'rgba(0,0,0,.05)',
            gap: 2,
            marginBottom: 22,
          }}
        >
          {(['login', 'signup'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAuthMode(mode)}
              style={{
                flex: 1,
                padding: '9px 0',
                border: 'none',
                borderRadius: 999,
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                background: authMode === mode ? '#fff' : 'transparent',
                color: authMode === mode ? c.ink : c.textMuted,
              }}
            >
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <AuthForm isLogin={isLogin} onSubmit={closeAuth} />

        <p style={{ marginTop: 18, fontSize: 12.5, color: c.textSubtle, textAlign: 'center' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setAuthMode(isLogin ? 'signup' : 'login')}
            data-hover="text"
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              color: c.primary,
              fontWeight: 500,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

function AuthForm({ isLogin, onSubmit }: { isLogin: boolean; onSubmit: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {!isLogin && (
        <label style={labelStyle}>
          Full name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Amaya Perera"
            autoComplete="name"
            style={fieldStyle}
          />
        </label>
      )}

      <label style={labelStyle}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          style={fieldStyle}
        />
      </label>

      <label style={labelStyle}>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          required
          minLength={6}
          style={fieldStyle}
        />
      </label>

      {isLogin && (
        <button
          type="button"
          data-hover="text"
          style={{
            alignSelf: 'flex-end',
            border: 'none',
            background: 'transparent',
            padding: 0,
            marginTop: -6,
            fontSize: 12.5,
            color: c.textMuted,
            cursor: 'pointer',
          }}
        >
          Forgot password?
        </button>
      )}

      <button
        type="submit"
        data-hover="primary"
        style={{
          height: 46,
          marginTop: 4,
          border: 'none',
          borderRadius: 10,
          background: c.primary,
          color: '#fff',
          fontSize: 14.5,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {isLogin ? 'Log in' : 'Create account'}
      </button>
    </form>
  )
}
