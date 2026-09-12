import {
  useEffect,
  useState
} from 'react'

import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { shareUrl } from '../lib/utils'
import {
  incrementView,
  toggleLike
} from '../lib/api'

export default function VideoCard({
  video,
  session,
  profile,
  onDeleted
}) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(
    video.likes_count || 0
  )
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (session) {
      supabase
        .from('video_likes')
        .select('video_id')
        .eq('video_id', video.id)
        .eq(
          'user_id',
          session.user.id
        )
        .maybeSingle()
        .then(({ data }) =>
          setLiked(!!data)
        )
    }
  }, [session, video.id])

  async function like() {
    if (!session) {
      alert('Log in to like videos.')
      return
    }

    if (busy) return

    setBusy(true)

    try {
      await toggleLike(
        video.id,
        session.user.id,
        liked
      )

      setLiked(!liked)

      setLikes(x =>
        Math.max(
          0,
          x + (liked ? -1 : 1)
        )
      )
    } catch (e) {
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    incrementView(video.id)
  }, [video.id])

  return (
    <article className="card video-card">

      <video
        src={video.video_url}
        controls
        playsInline
        preload="metadata"
      />

      <div className="video-info">

        <div>
          <Link
            to={`/player/${video.player_id}`}
          >
            <strong>
              {video.profiles?.full_name ||
                'Player'}
            </strong>
          </Link>

          <div className="muted">
            {video.title}
          </div>
        </div>

        <div className="actions">

          <button onClick={like}>
            ♥ {likes}
          </button>

          <button
            onClick={() =>
              shareUrl(
                `${location.origin}/video/${video.id}`
              )
            }
          >
            Share
          </button>

        </div>

      </div>

      {video.description && (
        <p>
          {video.description}
        </p>
      )}

    </article>
  )
}
