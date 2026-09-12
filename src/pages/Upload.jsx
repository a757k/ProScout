import {
  useEffect,
  useRef,
  useState
} from 'react'

import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { uploadVideo } from '../lib/api'

export default function Upload({
  profile
}) {
  const nav = useNavigate()
  const ref = useRef()

  const [file, setFile] =
    useState(null)

  const [duration, setDuration] =
    useState(0)

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [busy, setBusy] =
    useState(false)

  const [count, setCount] =
    useState(0)

  useEffect(() => {
    if (
      profile?.account_type !== 'player'
    ) {
      nav('/dashboard')
    } else {
      supabase
        .from('videos')
        .select('id', {
          count: 'exact',
          head: true
        })
        .eq(
          'player_id',
          profile.id
        )
        .then(({ count }) =>
          setCount(count || 0)
        )
    }
  }, [profile])

  function choose(f) {
    if (!f) return

    const v =
      document.createElement('video')

    v.preload = 'metadata'

    v.onloadedmetadata = () => {
      URL.revokeObjectURL(v.src)

      setDuration(v.duration)

      if (v.duration > 120) {
        alert(
          'That video is longer than 2 minutes.'
        )
      }
    }

    v.src = URL.createObjectURL(f)

    setFile(f)
  }

  async function submit(e) {
    e.preventDefault()

    if (count >= 5) {
      return alert(
        'You already have 5 videos.'
      )
    }

    if (!file) {
      return alert(
        'Choose a video.'
      )
    }

    if (duration > 120) {
      return alert(
        'Video must be 2 minutes or shorter.'
      )
    }

    setBusy(true)

    try {
      await uploadVideo({
        userId: profile.id,
        file,
        duration,
        title,
        description
      })

      nav('/dashboard')
    } catch (e) {
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="narrow">

      <div className="page-title">

        <div>

          <span className="eyebrow">
            PLAYER
          </span>

          <h1>
            Upload a video
          </h1>

          <p>
            {count}/5 videos used ·
            maximum 2 minutes each.
          </p>

        </div>

      </div>

      <form
        className="card"
        onSubmit={submit}
      >

        <label>
          Video

          <input
            ref={ref}
            type="file"
            accept="video/*"
            onChange={e =>
              choose(
                e.target.files?.[0]
              )
            }
          />
        </label>

        {file && (
          <p className="muted">
            {file.name} ·{' '}
            {Math.round(duration)}
            {' '}seconds
          </p>
        )}

        <label>
          Title

          <input
            value={title}
            onChange={e =>
              setTitle(e.target.value)
            }
            placeholder="e.g. Match highlights vs Al Sadd"
          />
        </label>

        <label>
          Description

          <textarea
            value={description}
            onChange={e =>
              setDescription(
                e.target.value
              )
            }
            placeholder="What should scouts notice?"
          />
        </label>

        <button
          className="primary"
          disabled={busy}
        >
          {busy
            ? 'Uploading…'
            : 'Upload video'}
        </button>

      </form>

    </section>
  )
}
