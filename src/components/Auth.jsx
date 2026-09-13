import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Auth() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('player')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'login') {
      const result = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (result.error) {
        setError(result.error.message)
        setLoading(false)
        return
      }

      navigate('/dashboard')
      setLoading(false)
      return
    }

    const result = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          account_type: role
        }
      }
    })

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    if (result.data.session) {
      navigate('/dashboard')
    } else {
      setError('Account created. Check your email, confirm it, then log in.')
    }

    setLoading(false)
  }

  function switchMode() {
    setError('')

    if (mode === 'login') {
      setMode('signup')
    } else {
      setMode('login')
    }
  }

  return (
    <div className="auth card">
      <h1>
        {mode === 'login'
          ? 'Welcome back'
          : 'Create your ProScout account'}
      </h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <>
            <label>
              Full name
              <input
                type="text"
                value={name}
                required
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label>
              Account type
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="player">Player</option>
                <option value="club">Club</option>
              </select>
            </label>
          </>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            required
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button
          type="submit"
          className="primary"
          disabled={loading}
        >
          {loading
            ? 'Please wait...'
            : mode === 'login'
              ? 'Log in'
              : 'Sign up'}
        </button>
      </form>

      <button
        type="button"
        className="linkbutton"
        onClick={switchMode}
      >
        {mode === 'login'
          ? 'Do not have an account? Sign up'
          : 'Already have an account? Log in'}
      </button>
    </div>
  )
}
