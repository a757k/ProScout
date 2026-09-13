import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Auth() {
const [mode, setMode] = useState('login')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [name, setName] = useState('')
const [role, setRole] = useState('player')
const [err, setErr] = useState('')
const [busy, setBusy] = useState(false)
const navigate = useNavigate()

async function submit(e) {
e.preventDefault()
setErr('')
setBusy(true)

```
try {
  if (mode === 'login') {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    navigate('/dashboard')
  } else {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          account_type: role
        }
      }
    })

    if (error) throw error

    if (data.session) {
      navigate('/dashboard')
    } else {
      setErr(
        'Account created successfully. Check your email to confirm your account, then log in.'
      )
    }
  }
} catch (error) {
  setErr(error?.message || 'Something went wrong.')
} finally {
  setBusy(false)
}
```

}

return ( <div className="auth card"> <h1>
{mode === 'login'
? 'Welcome back'
: 'Create your ProScout account'} </h1>

```
  {err && <div className="error">{err}</div>}

  <form onSubmit={submit}>
    {mode === 'signup' && (
      <>
        <label>
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Account type
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
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
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </label>

    <label>
      Password
      <input
        type="password"
        minLength="6"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </label>

    <button className="primary" disabled={busy}>
      {busy
        ? 'Please wait…'
        : mode === 'login'
          ? 'Log in'
          : 'Sign up'}
    </button>
  </form>

  <button
    className="linkbutton"
    onClick={() =>
      setMode(mode === 'login' ? 'signup' : 'login')
    }
  >
    {mode === 'login'
      ? "Don't have an account? Sign up"
      : 'Already have an account? Log in'}
  </button>
</div>
```

)
}
