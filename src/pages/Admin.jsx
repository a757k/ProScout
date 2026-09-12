import {
  useEffect,
  useState
} from 'react'

import { supabase } from '../supabase'

export default function Admin() {
  const [clubs, setClubs] =
    useState([])

  const [reports, setReports] =
    useState([])

  const [ok, setOk] =
    useState(false)

  useEffect(() => {
    ;(async () => {
      const {
        data
      } = await supabase.rpc(
        'is_admin'
      )

      if (!data) return

      setOk(true)
      load()
    })()
  }, [])

  async function load() {
    const a = await supabase
      .from('profiles')
      .select('*')
      .eq(
        'account_type',
        'club'
      )
      .eq(
        'verification_status',
        'pending'
      )
      .order(
        'created_at'
      )

    setClubs(a.data || [])

    const b = await supabase
      .from('reports')
      .select(
        '*,reporter:reporter_id(full_name)'
      )
      .order(
        'created_at',
        {
          ascending: false
        }
      )

    setReports(b.data || [])
  }

  async function verify(
    id,
    approved
  ) {
    const {
      error
    } = await supabase
      .from('profiles')
      .update({
        club_verified:
          approved,
        verification_status:
          approved
            ? 'verified'
            : 'rejected'
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      load()
    }
  }

  async function suspend(
    id,
    val
  ) {
    const {
      error
    } = await supabase
      .from('profiles')
      .update({
        is_suspended: val
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      load()
    }
  }

  async function resolve(id) {
    const {
      error
    } = await supabase
      .from('reports')
      .update({
        status: 'resolved'
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      load()
    }
  }

  if (!ok) {
    return (
      <div className="card">
        <h2>
          Admin access required
        </h2>
      </div>
    )
  }

  return (
    <section>

      <div className="page-title">

        <div>

          <span className="eyebrow">
            ADMIN
          </span>

          <h1>
            Moderation
          </h1>

        </div>

      </div>

      <h2>
        Club verification
      </h2>

      <div className="list">

        {clubs.map(c => (
          <article
            className="card"
            key={c.id}
          >

            <div className="split">

              <div>

                <h3>
                  {c.full_name}
                </h3>

                <p>
                  {c.country}
                  {' · '}
                  {c.city}
                  {' · '}
                  {c.league}
                </p>

                <p>
                  Website:{' '}
                  {c.official_website ||
                    '—'}
                  {' · '}
                  Instagram:{' '}
                  {c.official_instagram ||
                    '—'}
                </p>

                <p>
                  Contact:{' '}
                  {c.verification_contact ||
                    '—'}
                </p>

              </div>

              <div className="actions">

                <button
                  className="primary"
                  onClick={() =>
                    verify(
                      c.id,
                      true
                    )
                  }
                >
                  Verify
                </button>

                <button
                  onClick={() =>
                    verify(
                      c.id,
                      false
                    )
                  }
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    suspend(
                      c.id,
                      true
                    )
                  }
                >
                  Suspend
                </button>

              </div>

            </div>

          </article>
        ))}

        {!clubs.length && (
          <p className="muted">
            No pending clubs.
          </p>
        )}

      </div>

      <h2>
        Reports
      </h2>

      <div className="list">

        {reports.map(r => (
          <article
            className="card"
            key={r.id}
          >

            <p>
              <b>
                {r.reason}
              </b>
            </p>

            <p>
              {r.details}
            </p>

            <p className="muted">
              Status: {r.status}
            </p>

            {r.status !==
              'resolved' && (
              <button
                onClick={() =>
                  resolve(r.id)
                }
              >
                Mark resolved
              </button>
            )}

          </article>
        ))}

      </div>

    </section>
  )
}
