import {
  useEffect,
  useState
} from 'react'

import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

import {
  positions,
  feet,
  levels,
  countries
} from '../lib/utils'

export default function EditProfile({
  profile
}) {
  const nav = useNavigate()

  const [f, setF] =
    useState({})

  const [busy, setBusy] =
    useState(false)

  useEffect(() => {
    setF(profile || {})
  }, [profile])

  if (!profile) return null

  function set(k, v) {
    setF(x => ({
      ...x,
      [k]: v
    }))
  }

  async function save(e) {
    e.preventDefault()

    if (
      !f.contact_email &&
      !f.phone &&
      !f.instagram
    ) {
      return alert(
        'Add at least one contact method.'
      )
    }

    setBusy(true)

    const allowed = [
      'full_name',
      'phone',
      'instagram',
      'contact_email',
      'country',
      'city',
      'age',
      'position',
      'preferred_foot',
      'height_cm',
      'playing_level',
      'current_club',
      'bio',
      'official_website',
      'official_instagram',
      'league',
      'verification_contact'
    ]

    const data = {}

    allowed.forEach(
      k => {
        data[k] =
          f[k] ?? null
      }
    )

    const {
      error
    } = await supabase
      .from('profiles')
      .update(data)
      .eq(
        'id',
        profile.id
      )

    if (error) {
      alert(error.message)
    } else {
      nav('/dashboard')
    }

    setBusy(false)
  }

  return (
    <section className="narrow">

      <div className="page-title">

        <div>

          <span className="eyebrow">
            PROFILE
          </span>

          <h1>
            Edit profile
          </h1>

        </div>

      </div>

      <form
        className="card form-grid"
        onSubmit={save}
      >

        <label>
          Full name

          <input
            required
            value={f.full_name || ''}
            onChange={e =>
              set(
                'full_name',
                e.target.value
              )
            }
          />
        </label>

        <label>
          Email

          <input
            type="email"
            value={
              f.contact_email || ''
            }
            onChange={e =>
              set(
                'contact_email',
                e.target.value
              )
            }
          />
        </label>

        <label>
          Phone

          <input
            value={f.phone || ''}
            onChange={e =>
              set(
                'phone',
                e.target.value
              )
            }
          />
        </label>

        <label>
          Instagram

          <input
            value={
              f.instagram || ''
            }
            onChange={e =>
              set(
                'instagram',
                e.target.value
              )
            }
            placeholder="@username"
          />
        </label>

        <label>
          Country

          <select
            value={
              f.country || ''
            }
            onChange={e =>
              set(
                'country',
                e.target.value
              )
            }
          >
            <option value="">
              Select
            </option>

            {countries.map(x => (
              <option key={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label>
          City

          <input
            value={f.city || ''}
            onChange={e =>
              set(
                'city',
                e.target.value
              )
            }
          />
        </label>

        {profile.account_type === 'player'
          ? (
            <>
              <label>
                Age

                <input
                  type="number"
                  min="5"
                  max="60"
                  value={f.age || ''}
                  onChange={e =>
                    set(
                      'age',
                      e.target.value
                        ? Number(
                            e.target.value
                          )
                        : null
                    )
                  }
                />
              </label>

              <label>
                Position

                <select
                  value={
                    f.position || ''
                  }
                  onChange={e =>
                    set(
                      'position',
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select
                  </option>

                  {positions.map(x => (
                    <option key={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Preferred foot

                <select
                  value={
                    f.preferred_foot ||
                    ''
                  }
                  onChange={e =>
                    set(
                      'preferred_foot',
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select
                  </option>

                  {feet.map(x => (
                    <option key={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Height (cm)

                <input
                  type="number"
                  value={
                    f.height_cm || ''
                  }
                  onChange={e =>
                    set(
                      'height_cm',
                      e.target.value
                        ? Number(
                            e.target.value
                          )
                        : null
                    )
                  }
                />
              </label>

              <label>
                Playing level

                <select
                  value={
                    f.playing_level ||
                    ''
                  }
                  onChange={e =>
                    set(
                      'playing_level',
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select
                  </option>

                  {levels.map(x => (
                    <option key={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Current club

                <input
                  value={
                    f.current_club ||
                    ''
                  }
                  onChange={e =>
                    set(
                      'current_club',
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="full">
                Bio

                <textarea
                  value={f.bio || ''}
                  onChange={e =>
                    set(
                      'bio',
                      e.target.value
                    )
                  }
                />
              </label>
            </>
          )
          : (
            <>
              <label>
                Official website

                <input
                  value={
                    f.official_website ||
                    ''
                  }
                  onChange={e =>
                    set(
                      'official_website',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Official Instagram

                <input
                  value={
                    f.official_instagram ||
                    ''
                  }
                  onChange={e =>
                    set(
                      'official_instagram',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                League

                <input
                  value={
                    f.league || ''
                  }
                  onChange={e =>
                    set(
                      'league',
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Verification contact

                <input
                  value={
                    f.verification_contact ||
                    ''
                  }
                  onChange={e =>
                    set(
                      'verification_contact',
                      e.target.value
                    )
                  }
                  placeholder="Name / role"
                />
              </label>
            </>
          )}

        <button
          className="primary full"
          disabled={busy}
        >
          {busy
            ? 'Saving…'
            : 'Save profile'}
        </button>

      </form>

    </section>
  )
}
