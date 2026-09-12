import { Link } from 'react-router-dom'

export default function PlayerCard({
  p,
  canSave,
  saved,
  onSave
}) {
  return (
    <article className="card player-card">

      <div className="avatar">
        {(p.full_name || 'P')
          .split(' ')
          .map(x => x[0])
          .join('')
          .slice(0, 2)}
      </div>

      <div className="grow">

        <Link to={`/player/${p.id}`}>
          <h3>{p.full_name}</h3>
        </Link>

        <div className="muted">
          {p.position || 'Position not set'}
          {' · '}
          {p.age || 'Age not set'}
        </div>

        <div className="muted">
          {[p.city, p.country]
            .filter(Boolean)
            .join(', ')}
        </div>

        {p.current_club && (
          <div className="tag">
            {p.current_club}
          </div>
        )}

      </div>

      {canSave && (
        <button
          className="small"
          onClick={() => onSave(p.id)}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      )}

    </article>
  )
}
