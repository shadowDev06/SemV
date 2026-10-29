import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="not-found">
      <span className="eyebrow">404</span>
      <h1>This route did not ship.</h1>
      <p>
        The URL is not part of the application. Vercel sends unknown paths to{' '}
        <code>index.html</code>, and React Router renders this page instead of a
        server error.
      </p>
      <Link className="button" to="/">
        Back to the overview
      </Link>
    </section>
  )
}
