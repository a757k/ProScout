import {
  useEffect,
  useState
} from 'react'

import { supabase } from '../supabase'
import VideoCard from '../components/VideoCard'

export default function Videos({
  session,
  profile
}) {
  const [videos, setVideos] =
    useState([])

  const [sort, setSort] =
    useState('likes')

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    load()
  }, [sort])

  async function load() {
    setLoading(true)

    let q = supabase
      .from('videos')
      .select(
        '*,profiles!videos_player_id_fkey(id,full_name)'
      )
      .eq(
        'profiles.is_suspended',
        false
      )

    if (sort === 'likes') {
      q = q
        .order('likes_count', {
          ascending: false
        })
        .order('created_at', {
          ascending: false
        })
    } else if (sort === 'views') {
      q = q.order(
        'views_count',
        {
          ascending: false
        }
      )
    } else {
      q = q.order(
        'created_at',
        {
          ascending: false
        }
      )
    }

    const {
      data,
      error
    } = await q

    if (error) {
      alert(error.message)
    } else {
      setVideos(data || [])
    }

    setLoading(false)
  }

  return (
    <section>

      <div className="page-title">

        <div>

          <span className="eyebrow">
            DISCOVER
          </span>

          <h1>
            Video scouting
          </h1>

          <p>
            Browse player videos,
            with most-liked videos
            at the top.
          </p>

        </div>

        <select
          value={sort}
          onChange={e =>
            setSort(e.target.value)
          }
        >
          <option value="likes">
            Most liked
          </option>

          <option value="views">
            Most viewed
          </option>

          <option value="newest">
            Newest
          </option>
        </select>

      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
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
      )}

    </section>
  )
}
