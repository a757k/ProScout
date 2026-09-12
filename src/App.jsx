import { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom'

import { supabase } from './supabase'
import { getProfile } from './lib/api'

import Layout from './components/Layout'
import Auth from './components/Auth'

import Home from './pages/Home'
import Search from './pages/Search'
import Videos from './pages/Videos'
import PlayerProfile from './pages/PlayerProfile'
import VideoPage from './pages/VideoPage'
import Upload from './pages/Upload'
import Dashboard from './pages/Dashboard'
import Inbox from './pages/Inbox'
import Trials from './pages/Trials'
import EditProfile from './pages/EditProfile'
import Admin from './pages/Admin'

function Guard({ session, children }) {
  return session ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loc = useLocation()

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return

      setSession(data.session)

      if (data.session) {
        try {
          setProfile(await getProfile(data.session.user.id))
        } catch {}
      }

      setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      if (session) {
        try {
          setProfile(await getProfile(session.user.id))
        } catch {}
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="loading">Loading ProScout…</div>
  }

  return (
    <Layout session={session} profile={profile}>
      <Routes location={loc}>

        <Route
          path="/"
          element={<Home session={session} />}
        />

        <Route
          path="/login"
          element={
            session
              ? <Navigate to="/dashboard" />
              : <Auth />
          }
        />

        <Route
          path="/search"
          element={
            <Guard session={session}>
              <Search profile={profile} />
            </Guard>
          }
        />

        <Route
          path="/videos"
          element={
            <Videos
              session={session}
              profile={profile}
            />
          }
        />

        <Route
          path="/player/:id"
          element={
            <PlayerProfile
              session={session}
              profile={profile}
            />
          }
        />

        <Route
          path="/video/:id"
          element={
            <VideoPage
              session={session}
              profile={profile}
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <Guard session={session}>
              <Dashboard
                profile={profile}
                session={session}
              />
            </Guard>
          }
        />

        <Route
          path="/upload"
          element={
            <Guard session={session}>
              <Upload profile={profile} />
            </Guard>
          }
        />

        <Route
          path="/inbox"
          element={
            <Guard session={session}>
              <Inbox profile={profile} />
            </Guard>
          }
        />

        <Route
          path="/trials"
          element={
            <Guard session={session}>
              <Trials profile={profile} />
            </Guard>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <Guard session={session}>
              <EditProfile profile={profile} />
            </Guard>
          }
        />

        <Route
          path="/admin"
          element={
            <Guard session={session}>
              <Admin />
            </Guard>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </Layout>
  )
}
