import React, { useState } from 'react'
import { supabase } from './supabase'

const s = {
  wrap: { minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#1a1a1a', borderRadius: '20px', padding: '36px 28px', width: '100%', maxWidth: '380px', border: '1px solid #2a2a2a' },
  title: { fontSize: '26px', fontWeight: '600', color: '#f0f0f0', marginBottom: '6px' },
  sub: { fontSize: '15px', color: '#666', marginBottom: '32px' },
  label: { fontSize: '13px', color: '#888', marginBottom: '6px', display: 'block' },
  input: { width: '100%', background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '14px 16px', color: '#f0f0f0', fontSize: '17px', marginBottom: '16px', outline: 'none' },
  btn: { width: '100%', background: '#5DCAA5', border: 'none', borderRadius: '12px', padding: '16px', color: '#111', fontSize: '17px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' },
  toggle: { width: '100%', background: 'transparent', border: '1px solid #333', borderRadius: '12px', padding: '14px', color: '#888', fontSize: '15px', cursor: 'pointer' },
  err: { color: '#E24B4A', fontSize: '14px', marginBottom: '12px', textAlign: 'center' },
  msg: { color: '#5DCAA5', fontSize: '14px', marginBottom: '12px', textAlign: 'center' },
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(''); setMessage(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setMessage('Check your email to confirm your account!')
      }
    } catch (e) { setError('Something went wrong. Try again.') }
    setLoading(false)
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.title}>Planning Center</div>
        <div style={s.sub}>{mode === 'login' ? 'Welcome back, Musawwir' : 'Create your account'}</div>
        {error && <div style={s.err}>{error}</div>}
        {message && <div style={s.msg}>{message}</div>}
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
        <button style={s.toggle} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
    }
