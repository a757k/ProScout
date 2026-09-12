import { Link } from 'react-router-dom'
import {
  useEffect,
  useState
} from 'react'

import { supabase } from '../supabase'
import VideoCard from '../components/VideoCard'

export default function Dashboard({
  profile,
  session
}) {
  const [videos, setVideos] =
    useState([])

  const [saved, setSaved] =
    useState([])

  const [msgCount, setMsgCount] =
    useState(0)

  useEffect(() => {
    if (!profile) return

    ;(async () => {

      if (
        profile.account_type === 'player'
      ) {
        const {
          data
        } = await supabase
          .from('videos')
          .select(
            '*,profiles!videos_player_id_fkey(id,full_name)'
          )
          .eq(
            'player_id',
            profile.id
          )
          .order(
            'created_at',
            {
              ascending: false
            }
          )

        setVideos(data || [])
      } else {
        const {
          data
        } = await supabase
          .from('saved_players')
          .select(
            '*,player:player_id(id,full_name,position,age,city,country)'
          )
          .eq(
            'club_id',
            profile.id
          )

        setSaved(data || [])
      }

      const q =
        await supabase
          .from('messages')
          .select('id', {
            count: 'exact',
            head: true
          })
          .eq(
            profile.account_type === 'club'
              ? 'club_id'
              : 'player_id',
            profile.id
          )

      setMsgCount(q.count || 0)
    })()
  }, [profile?.id])

  if (!profile) return null

  return (
    <section>

      <div className="page-title">

        <div>

          <span className="eyebrow">
            DASHBOARD
          </span>

          <h1>
            {profile.full_name}
          </h1>

          <p>
            {profile.account_type === 'club'
              ? (
                profile.club_verified
                  ? '✓ Verified club'
                  : 'Verification pending'
              )
              : 'Player account'}
          </p>

        </div>

      </div>

      <div className="dashboard-grid">

        <Link
          className="dash-card"
          to="/search"
        >
          <b>
            Search players
          </b>

          <span>
            Find by age, position,
            country and city.
          </span>
        </Link>

        <Link
          className="dash-card"
          to="/videos"
        >
          <b>
            Video discovery
          </b>

          <span>
            Browse the most-liked
            player videos.
          </span>
        </Link>

        <Link
          className="dash-card"
          to="/trials"
        >
          <b>
            Trials
          </b>

          <span>
            Manage trial invitations.
          </span>
        </Link>

        <Link
          className="dash-card"
          to="/inbox"
        >
          <b>
            Messages
          </b>

          <span>
            {msgCount} message
            {msgCount === 1
              ? ''
              : 's'}.
          </span>
        </Link>

        {profile.account_type === 'player' && (
          <Link
            className="dash-card"
            to="/upload"
          >
            <b>
              Upload video
            </b>

            <span>
              Up to 5 videos,
              2 minutes each.
            </span>
          </Link>
        )}

        {profile.account_type === 'club' && (
          <Link
            className="dash-card"
            to="/profile/edit"
          >
            <b>
              Club profile
            </b>

            <span>
              Update verification
              information.
            </span>
          </Link>
        )}

        {profile.account_type === 'player' && (
          <Link
            className="dash-card"
            to="/profile/edit"
          >
            <b>
              Edit profile
            </b>

            <span>
              Update your football
              details.
            </span>
          </Link>
        )}

      </div>

      {profile.account_type === 'player' && (
        <>
          <h2>
            Your videos
          </h2>

          <div className="video-grid">

            {videos.map(v => (
              <VideoCard
                key={v.id}
                video={v}
                session={session}
                profile={profile}
              />
            ))}

          </div>
        </>
      )}

      {profile.account_type === 'club' && (
        <>
          <h2>
            Saved players
          </h2>

          <div className="grid">

            {saved.map(s => (
              <Link
                className="card"
                key={s.player_id}
                to={`/player/${s.player_id}`}
              >
                <h3>
                  {s.player?.full_name}
                </h3>

                <p>
                  {s.player?.position}
                  {' · '}
                  {s.player?.age}
                  {' · '}
                  {s.player?.city},{' '}
                  {s.player?.country}
                </p>
              </Link>
            ))}

          </div>
        </>
      )}

    </section>
  )
}
