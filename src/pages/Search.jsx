import {
  useEffect,
  useState
} from 'react'

import { supabase } from '../supabase'
import {
  positions,
  countries,
  levels
} from '../lib/utils'

import PlayerCard from '../components/PlayerCard'

export default function Search({
  profile
}) {
  const [filters, setFilters] = useState({
    q: '',
    position: '',
    country: '',
    city: '',
    age: '',
    level: ''
  })

  const [players, setPlayers] = useState([])
  const [saved, setSaved] = useState(
    new Set()
  )

  const [loading, setLoading] =
    useState(false)

  async function search() {
    setLoading(true)

    let q = supabase
      .from('profiles')
      .select('*')
      .eq('account_type', 'player')
      .eq('is_suspended', false)
      .order('created_at', {
        ascending: false
      })

    if (filters.q) {
      q = q.ilike(
        'full_name',
        `%${filters.q}%`
      )
    }

    if (filters.position) {
      q = q.eq(
        'position',
        filters.position
      )
    }

    if (filters.country) {
      q = q.eq(
        'country',
        filters.country
      )
    }

    if (filters.city) {
      q = q.ilike(
        'city',
        `%${filters.city}%`
      )
    }

    if (filters.age) {
      q = q.eq(
        'age',
        Number(filters.age)
      )
    }

    if (filters.level) {
      q = q.eq(
        'playing_level',
        filters.level
      )
    }

    const {
      data,
      error
    } = await q

    if (error) {
      alert(error.message)
    } else {
      setPlayers(data || [])
    }

    if (
      profile?.account_type === 'club'
    ) {
      const {
        data: s
      } = await supabase
        .from('saved_players')
        .select('player_id')
        .eq(
          'club_id',
          profile.id
        )

      setSaved(
        new Set(
          (s || []).map(
            x => x.player_id
          )
        )
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    search()
  }, [])

  async function save(id) {
    const yes = saved.has(id)

    try {
      if (yes) {
        await supabase
          .from('saved_players')
          .delete()
          .eq('club_id', profile.id)
          .eq('player_id', id)
      } else {
        await supabase
          .from('saved_players')
          .insert({
            club_id: profile.id,
            player_id: id
          })
      }

      setSaved(s => {
        const n = new Set(s)

        yes
          ? n.delete(id)
          : n.add(id)

        return n
      })
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <section>

      <div className="page-title">
        <div>

          <span className="eyebrow">
            SCOUTING
          </span>

          <h1>
            Find players
          </h1>

          <p>
            Search by position, age,
            country and location.
          </p>

        </div>
      </div>

      <div className="card filters">

        <input
          placeholder="Player name"
          value={filters.q}
          onChange={e =>
            setFilters({
              ...filters,
              q: e.target.value
            })
          }
        />

        <select
          value={filters.position}
          onChange={e =>
            setFilters({
              ...filters,
              position: e.target.value
            })
          }
        >
          <option value="">
            Any position
          </option>

          {positions.map(x => (
            <option key={x}>
              {x}
            </option>
          ))}
        </select>

        <select
          value={filters.country}
          onChange={e =>
            setFilters({
              ...filters,
              country: e.target.value
            })
          }
        >
          <option value="">
            Any country
          </option>

          {countries.map(x => (
            <option key={x}>
              {x}
            </option>
          ))}
        </select>

        <input
          placeholder="City"
          value={filters.city}
          onChange={e =>
            setFilters({
              ...filters,
              city: e.target.value
            })
          }
        />

        <input
          type="number"
          min="5"
          max="60"
          placeholder="Age"
          value={filters.age}
          onChange={e =>
            setFilters({
              ...filters,
              age: e.target.value
            })
          }
        />

        <select
          value={filters.level}
          onChange={e =>
            setFilters({
              ...filters,
              level: e.target.value
            })
          }
        >
          <option value="">
            Any level
          </option>

          {levels.map(x => (
            <option key={x}>
              {x}
            </option>
          ))}
        </select>

        <button
          className="primary"
          onClick={search}
        >
          Search
        </button>

      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid">

          {players.map(p => (
            <PlayerCard
              key={p.id}
              p={p}
              canSave={
                profile?.account_type === 'club'
              }
              saved={saved.has(p.id)}
              onSave={save}
            />
          ))}

          {!players.length && (
            <div className="card">
              <h3>
                No players found
              </h3>

              <p>
                Try fewer filters.
              </p>
            </div>
          )}

        </div>
      )}

    </section>
  )
}
