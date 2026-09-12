import {
  Link,
  NavLink,
  useNavigate
} from 'react-router-dom'

import { supabase } from '../supabase'

export default function Layout({
  session,
  profile,
  children
}) {
  const nav = useNavigate()

  const link = ({ isActive }) =>
    isActive ? 'nav active' : 'nav'

  async function logout() {
    await supabase.auth.signOut()
    nav('/')
  }

  return (
    <div className="app">

      <header>
        <Link className="brand" to="/">
          ProScout
        </Link>

        <nav>
          {session && (
            <>
              <NavLink
                className={link}
                to="/search"
              >
                Players
              </NavLink>

              <NavLink
                className={link}
                to="/videos"
              >
                Videos
              </NavLink>

              <NavLink
                className={link}
                to="/dashboard"
              >
                Dashboard
              </NavLink>
            </>
          )}

          {!session && (
            <NavLink
              className={link}
              to="/login"
            >
              Login
            </NavLink>
          )}
        </nav>

        {session && (
          <button
            className="ghost"
            onClick={logout}
          >
            Log out
          </button>
        )}
      </header>

      <main>
        {children}
      </main>

      <footer>
        ProScout · Football scouting marketplace
      </footer>

    </div>
  )
}
