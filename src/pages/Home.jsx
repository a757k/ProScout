import { Link } from 'react-router-dom'

export default function Home({ session }) {
  return (
    <section className="hero">

      <div>

        <span className="eyebrow">
          Football scouting, simplified
        </span>

        <h1>
          Get discovered.
          <br />
          Find talent.
        </h1>

        <p>
          ProScout connects football players
          with clubs through profiles,
          highlight videos, trials and
          verified club communication.
        </p>

        <div className="hero-actions">

          <Link
            className="primary button"
            to={session ? '/search' : '/login'}
          >
            {session
              ? 'Find players'
              : 'Get started'}
          </Link>

          <Link
            className="secondary button"
            to="/videos"
          >
            Explore videos
          </Link>

        </div>

      </div>

      <div className="hero-card">

        <div className="ball">
          ⚽
        </div>

        <h3>
          Built for real scouting
        </h3>

        <p>
          Player profiles · Up to 5 videos ·
          Verified clubs · Trial invitations ·
          Likes · Club-only messaging
        </p>

      </div>

    </section>
  )
}
