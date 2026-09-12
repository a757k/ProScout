import {
  useEffect,
  useState
} from 'react'

import { supabase } from '../supabase'
import { formatDate } from '../lib/utils'

export default function Inbox({
  profile
}) {
  const [messages, setMessages] =
    useState([])

  const [text, setText] =
    useState('')

  const [selected, setSelected] =
    useState(null)

  const [players, setPlayers] =
    useState({})

  useEffect(() => {
    load()
  }, [])

  async function load() {
    let q = supabase
      .from('messages')
      .select(
        '*,player:player_id(id,full_name),club:club_id(id,full_name)'
      )
      .order(
        'created_at',
        {
          ascending: true
        }
      )

    if (
      profile.account_type === 'club'
    ) {
      q = q.eq(
        'club_id',
        profile.id
      )
    } else {
      q = q.eq(
        'player_id',
        profile.id
      )
    }

    const {
      data,
      error
    } = await q

    if (error) {
      alert(error.message)
    } else {
      setMessages(data || [])

      const ids = {}

      ;(data || []).forEach(m => {
        ids[m.player_id] =
          m.player?.full_name ||
          'Player'
      })

      setPlayers(ids)

      if (
        data?.length &&
        !selected
      ) {
        setSelected(
          data[0].player_id
        )
      }
    }
  }

  const conv = messages.filter(
    m =>
      profile.account_type === 'club'
        ? m.player_id === selected
        : true
  )

  async function send() {
    if (
      !text.trim() ||
      profile.account_type !== 'club' ||
      !selected
    ) {
      return
    }

    const {
      error
    } = await supabase
      .from('messages')
      .insert({
        club_id: profile.id,
        player_id: selected,
        sender_id: profile.id,
        body: text.trim()
      })

    if (error) {
      alert(error.message)
    } else {
      setText('')
      load()
    }
  }

  if (
    profile.account_type === 'player'
  ) {
    return (
      <section>

        <div className="page-title">

          <div>

            <span className="eyebrow">
              INBOX
            </span>

            <h1>
              Club messages
            </h1>

            <p>
              You can receive messages
              from clubs. Players cannot
              send chat messages.
            </p>

          </div>

        </div>

        <div className="card messages">

          {messages.map(m => (
            <div
              className="message"
              key={m.id}
            >
              <b>
                {m.club?.full_name ||
                  'Club'}
              </b>

              <p>
                {m.body}
              </p>

              <small>
                {formatDate(
                  m.created_at
                )}
              </small>
            </div>
          ))}

          {!messages.length && (
            <p className="muted">
              No messages yet.
            </p>
          )}

        </div>

      </section>
    )
  }

  return (
    <section>

      <div className="page-title">

        <div>

          <span className="eyebrow">
            CLUB MESSAGING
          </span>

          <h1>
            Messages
          </h1>

        </div>

      </div>

      <div className="chat-layout card">

        <aside>

          {Object.entries(players).map(
            ([id, name]) => (
              <button
                className={
                  selected === id
                    ? 'selected chat-person'
                    : 'chat-person'
                }
                onClick={() =>
                  setSelected(id)
                }
                key={id}
              >
                {name}
              </button>
            )
          )}

        </aside>

        <div className="chat">

          <div className="chat-body">

            {conv.map(m => (
              <div
                className="message"
                key={m.id}
              >
                <p>
                  {m.body}
                </p>

                <small>
                  {formatDate(
                    m.created_at
                  )}
                </small>
              </div>
            ))}

          </div>

          <div className="chat-compose">

            <input
              value={text}
              onChange={e =>
                setText(
                  e.target.value
                )
              }
              placeholder="Message player…"
            />

            <button
              className="primary"
              onClick={send}
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </section>
  )
}
