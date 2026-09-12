import {
  useEffect,
  useState
} from 'react'

import { useParams } from 'react-router-dom'
import { getVideo } from '../lib/api'
import VideoCard from '../components/VideoCard'

export default function VideoPage({
  session,
  profile
}) {
  const { id } = useParams()

  const [video, setVideo] =
    useState(null)

  useEffect(() => {
    getVideo(id)
      .then(setVideo)
      .catch(() => {})
  }, [id])

  if (!video) {
    return <p>Loading…</p>
  }

  return (
    <section>

      <div className="page-title">

        <div>

          <span className="eyebrow">
            SHARED VIDEO
          </span>

          <h1>
            {video.title}
          </h1>

        </div>

      </div>

      <div className="single-video">

        <VideoCard
          video={video}
          session={session}
          profile={profile}
        />

      </div>

    </section>
  )
}
