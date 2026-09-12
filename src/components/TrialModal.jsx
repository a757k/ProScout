import { useState } from 'react'
import Modal from './Modal'
import { supabase } from '../supabase'

export default function TrialModal({
  player,
  club,
  onClose
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(e) {
    e.preventDefault()

    setBusy(true)

    const {
      error
    } = await supabase
      .from('trial_invitations')
      .insert({
        club_id: club.id,
        player_id: player.id,
        date,
        time,
        location,
        message
      })

    if (error) {
      alert(error.message)
    } else {
      alert('Trial invitation sent')
      onClose()
    }

    setBusy(false)
  }

  return (
    <Modal
      title={`Invite ${player.full_name} to a trial`}
      onClose={onClose}
    >
      <form onSubmit={send}>

        <label>
          Date

          <input
            type="date"
            required
            value={date}
            onChange={e =>
              setDate(e.target.value)
            }
          />
        </label>

        <label>
          Time

          <input
            type="time"
            required
            value={time}
            onChange={e =>
              setTime(e.target.value)
            }
          />
        </label>

        <label>
          Location

          <input
            required
            value={location}
            onChange={e =>
              setLocation(e.target.value)
            }
            placeholder="Training ground / stadium"
          />
        </label>

        <label>
          Message

          <textarea
            value={message}
            onChange={e =>
              setMessage(e.target.value)
            }
            placeholder="Optional details"
          />
        </label>

        <button
          className="primary"
          disabled={busy}
        >
          {busy
            ? 'Sending…'
            : 'Send invitation'}
        </button>

      </form>
    </Modal>
  )
}
