import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="brand-mark">standout<span>.</span></span>
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1>This page has moved on.</h1>
      <Link to="/" className="button button-dark"><ArrowLeft size={16} /> Back to the portfolio</Link>
    </main>
  )
}
