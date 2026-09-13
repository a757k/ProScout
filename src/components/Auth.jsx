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

async function submit(event) {
event.preventDefault()
setErr('')
setBusy(true)

```
try {
  if (mode === 'login') {
    const result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (result.error) {
      throw result.error
    }

    navigate('/dashboard')
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
    throw result.error
  }

  if (result.data.session) {
    navigate('/dashboard')
  } else {
    setErr(
      'Account created successfully. Check your email to confirm your account, then log in.'
    )
  }
} catch (error) {
  setErr(error?.message || 'Something went wrong.')
} finally {
  setBusy(false)
}
```

}

function toggleMode() {
setErr('')
setMode(mode === 'login' ? 'signup' : 'login')
}

return ( <div className="auth card"> <h1>
{mode === 'login'
? 'Welcome back'
: 'Create your ProScout account'} </h1>

```
  {err ? <div className="error">{err}</div> : null}

  <form onSubmit={submit}>
    {mode === 'signup' ? (
      <>
        <label>
          Full name
          <input
            type="text"
            required
            value={name}
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
    ) : null}

    <label>
      Email
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
    </label>

    <label>
      Password
      <input
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
    </label>

    <button
      type="submit"
      className="primary"
      disabled={busy}
    >
      {busy
        ? 'Please wait...'
        : mode === 'login'
          ? 'Log in'
          : 'Sign up'}
    </button>
  </form>

  <button
    type="button"
    className="linkbutton"
    onClick={toggleMode}
  >
    {mode === 'login'
      ? "Don't have an account? Sign up"
      : 'Already have an account? Log in'}
  </button>
</div>
```

)
}
