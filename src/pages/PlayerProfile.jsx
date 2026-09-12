import {
  useEffect,
  useState
} from 'react'

import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { shareUrl } from '../lib/utils'

import VideoCard from '../components/VideoCard'
import TrialModal from '../components/TrialModal'

export default function PlayerProfile({
  session,
  profile
}) {
  const { id } = useParams()

  const [player, setPlayer] =
    useState(null)

  const [videos, setVideos] =
    useState([])

  const [trial, setTrial] =
    useState(false)

  const [saved, setSaved] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    ;(async () => {

      const a = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('account_type', 'player')
        .single()

      if (a.error) {
        setLoading(false)
        return
      }

      setPlayer(a.data)

      const b = await supabase
        .from('videos')
        .select(
          '*,profiles!videos_player_id_fkey(id,full_name)'
        )
        .eq('player_id', id)
        .order(
          'likes_count',
          {
            ascending: false
          }
        )

      setVideos(b.data || [])

      if (
        profile?.account_type === 'club'
      ) {
        const s = await supabase
          .from('saved_players')
          .select('player_id')
          .eq(
            'club_id',
            profile.id
          )
          .eq(
            'player_id',
            id
          )
          .maybeSingle()

        setSaved(!!s.data)
      }

      setLoading(false)
    })()
  }, [id, profile?.id])

  if (loading) {
    return <p>Loading…</p>
  }

  if (!player) {
    return (
      <div className="card">
        <h2>
          Player not found
        </h2>
      </div>
    )
  }

  const canContact =
    profile?.id === player.id ||
    (
      profile?.account_type === 'club' &&
      profile.club_verified
    )

  async function save() {
    if (saved) {
      await supabase
        .from('saved_players')
        .delete()
        .eq(
          'club_id',
          profile.id
        )
        .eq(
          'player_id',
          id
        )
    } else {
      await supabase
        .from('saved_players')
        .insert({
          club_id: profile.id,
          player_id: id
        })
    }

    setSaved(!saved)
  }

  return (
    <section>

      <div className="profile-head card">

        <div className="avatar big">
          {player.full_name
            ?.split(' ')
            .map(x => x[0])
            .join('')
            .slice(0, 2)}
        </div>

        <div className="grow">

          <div className="eyebrow">
            PLAYER PROFILE
          </div>

          <h1>
            {player.full_name}
          </h1>

          <p>
            {
              [
                player.position,
                player.age &&
                  `${player.age} yrs`,
                player.city,
                player.country
              ]
                .filter(Boolean)
                .join(' · ')
            }
          </p>

          {player.current_club && (
            <span className="tag">
              {player.current_club}
            </span>
          )}

          {player.playing_level && (
            <span className="tag">
              {player.playing_level}
            </span>
          )}

        </div>

        <div className="profile-actions">

          {profile?.account_type === 'club' &&
            profile.club_verified && (
              <>
                <button onClick={save}>
                  {saved
                    ? 'Saved'
                    : 'Save player'}
                </button>

                <button
                  className="primary"
                  onClick={() =>
                    setTrial(true)
                  }
                >
                  Invite to trial
                </button>
              </>
            )}

          <button
            onClick={() =>
              shareUrl(
                location.href,
                player.full_name
              )
            }
          >
            Share
          </button>

        </div>

      </div>

      <div className="two-col">

        <div>

          <h2>
            Videos ({videos.length}/5)
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

        </div>

        <aside className="card">

          <h3>
            Player information
          </h3>

          <p>
            <b>Position:</b>{' '}
            {player.position || '—'}
          </p>

          <p>
            <b>Preferred foot:</b>{' '}
            {player.preferred_foot || '—'}
          </p>

          <p>
            <b>Height:</b>{' '}
            {player.height_cm
              ? `${player.height_cm} cm`
              : '—'}
          </p>

          <p>
            <b>Level:</b>{' '}
            {player.playing_level || '—'}
          </p>

          {canContact ? (
            <>
              <hr />

              <h3>
                Contact
              </h3>

              <p>
                {player.contact_email && (
                  <>
                    Email:{' '}
                    <a
                      href={`mailto:${player.contact_email}`}
                    >
                      {player.contact_email}
                    </a>
                  </>
                )}
              </p>

              <p>
                {player.phone && (
                  <>
                    Phone:{' '}
                    <a
                      href={`tel:${player.phone}`}
                    >
                      {player.phone}
                    </a>
                  </>
                )}
              </p>

              <p>
                {player.instagram && (
                  <>
                    Instagram:{' '}
                    {player.instagram}
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="muted">
              Contact details are shown
              to the player and verified clubs.
            </p>
          )}

        </aside>

      </div>

      {trial && (
        <TrialModal
          player={player}
          club={profile}
          onClose={() =>
            setTrial(false)
          }
        />
      )}

    </section>
  )
}
