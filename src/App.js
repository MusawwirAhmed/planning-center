import React, { useState, useEffect } from 'react'
import './index.css'
import { supabase } from './supabase'
import Auth from './Auth'
import Dashboard from './Dashboard'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: '17px' }}>
      Loading...
    </div>
  )

  return user ? <Dashboard user={user} /> : <Auth />
        }
