import {
  useEffect,
  useState
} from 'react'

import { supabase } from '../supabase'
import { formatDate } from '../lib/utils'

export default function Trials({
  profile
}) {
  const [items, setItems] =
    useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    let q = supabase
      .from('trial_invitations')
      .select(
        '*,player:player_id(full_name),club:club_id(full_name)'
      )
      .order(
        'created_at',
        {
          ascending: false
        }
      )

    q =
      profile.account_type === 'club'
        ? q.eq(
            'club_id',
            profile.id
          )
        : q.eq(
            'player_id',
            profile.id
          )

    const {
      data,
      error
    } = await q

    if (error) {
      alert(error.message)
    } else {
      setItems(data || [])
    }
  }

  async function status(
    id,
    status
  ) {
    const {
      error
    } = await supabase
      .from('trial_invitations')
      .update({ status })
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      load()
    }
  }

  return (
    <section>

      <div className="page-title">

        <div>

          <span className="eyebrow">
            TRIALS
          </span>

          <h1>
            {profile.account_type === 'club'
              ? 'Sent invitations'
              : 'Trial invitations'}
          </h1>

        </div>

      </div>

      <div className="list">

        {items.map(x => (
          <article
            className="card"
            key={x.id}
          >

            <div className="split">

              <div>

                <h3>
                  {profile.account_type === 'club'
                    ? x.player?.full_name
                    : x.club?.full_name}
                </h3>

                <p>
                  <b>{x.date}</b>
                  {' '}at{' '}
                  <b>{x.time}</b>
                  {' · '}
                  {x.location}
                </p>

                <p>
                  {x.message}
                </p>

                <span className="tag">
                  {x.status}
                </span>

              </div>

              {profile.account_type === 'player' &&
                x.status === 'pending' && (
                  <div className="actions">

                    <button
                      className="primary"
                      onClick={() =>
                        status(
                          x.id,
                          'accepted'
                        )
                      }
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        status(
                          x.id,
                          'declined'
                        )
                      }
                    >
                      Decline
                    </button>

                    <button
                      onClick={() =>
                        status(
                          x.id,
                          'reschedule_requested'
                        )
                      }
                    >
                      Request new date
                    </button>

                  </div>
                )}

            </div>

            <small className="muted">
              Sent {formatDate(
                x.created_at
              )}
            </small>

          </article>
        ))}

        {!items.length && (
          <div className="card">
            <p className="muted">
              No trial invitations yet.
            </p>
          </div>
        )}

      </div>

    </section>
  )
}
