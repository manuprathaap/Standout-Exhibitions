import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, FileDown, Globe2, MapPin, Menu, X } from 'lucide-react'
import { api } from '../../lib/api.js'
import { printPortfolio } from './printPortfolio.js'

const serviceNotes = [
  'From first concept to the finishing details, we create spaces that bring brands to life.',
  'Thoughtful environments, crafted with care and built around the way people use them.',
  'Clear, confident visual identities that connect every part of your brand experience.',
  'Sound, screen and show production that makes every moment feel considered.',
  'Branded details made to keep your experience in people’s hands.',
  'Friendly, professional event support that helps every guest feel welcome.',
  'Distinctive wayfinding and signage designed to be seen, understood and remembered.',
]
const officeImages = ['/media/p07-03.jpg', '/media/p04-01.jpg', '/media/p16-01.jpg']

function Brand({ light = false, logo, alt = 'Standout logo' }) {
  if (logo) return <img className={`brand-logo-image${light ? ' brand-logo-light' : ''}`} src={logo} alt={alt} />
  return <span className={`brand-mark${light ? ' brand-mark-light' : ''}`}><span className="brand-word">standout<span>.</span></span><small className="brand-tagline">EXHIBITIONS · EVENTS · INTERIORS</small></span>
}

function SectionHeading({ section, inverse = false }) {
  return (
    <div className={`section-heading${inverse ? ' section-heading-inverse' : ''}`}>
      {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
      <h2>{section.title}</h2>
      {section.body && <p className="section-lead">{section.body}</p>}
    </div>
  )
}

function ProjectGallery({ projects, onSelect }) {
  const [filter, setFilter] = useState('All work')
  const categories = ['All work', ...new Set(projects.map(project => project.category).filter(Boolean))]
  const visible = filter === 'All work' ? projects : projects.filter(project => project.category === filter)
  return (
    <>
      <div className="project-filters" aria-label="Filter projects">
        {categories.map(category => <button key={category} className={category === filter ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter(category)}>{category}</button>)}
      </div>
      <div className="project-grid">
        {visible.map((project, index) => (
          <button key={project.id} className={`project-card project-card-${index % 4}`} onClick={() => onSelect(project)} aria-label={`View ${project.title}`}>
            <span className="project-image-wrap">
              <img src={project.image} alt={project.imageAlt || project.title} loading="lazy" />
              <span className="project-overlay">
                <small className="project-category">{project.category || 'Selected work'}</small>
                <span className="project-overlay-bottom"><strong>{project.title}</strong><span className="round-arrow"><ArrowUpRight size={18} /></span></span>
              </span>
            </span>
            <span className="project-meta"><span>{project.location || 'Standout · Selected project'}</span><span>VIEW PROJECT</span></span>
          </button>
        ))}
      </div>
    </>
  )
}

function ProjectLightbox({ project, onClose }) {
  const images = project.gallery?.length ? project.gallery : [project.image]
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') setIndex(current => (current + 1) % images.length)
      if (event.key === 'ArrowLeft') setIndex(current => (current + images.length - 1) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${project.title} gallery`} onClick={onClose}>
      <button className="lightbox-close" aria-label="Close gallery" onClick={onClose}><X /></button>
      <div className="lightbox-content" onClick={event => event.stopPropagation()}>
        <img src={images[index]} alt={project.imageAlt || `${project.title}, image ${index + 1}`} />
        {images.length > 1 && <>
          <button className="lightbox-arrow previous" aria-label="Previous image" onClick={() => setIndex(current => (current + images.length - 1) % images.length)}><ChevronLeft /></button>
          <button className="lightbox-arrow next" aria-label="Next image" onClick={() => setIndex(current => (current + 1) % images.length)}><ChevronRight /></button>
        </>}
        <div className="lightbox-caption"><span>{project.category} · {project.location}</span><strong>{project.imageCaption || project.title}</strong><small>{String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</small></div>
      </div>
    </div>
  )
}

function ViewerContent({ portfolio }) {
  const [activeProject, setActiveProject] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const sections = useMemo(() => portfolio.sections.filter(section => section.visible), [portfolio.sections])
  const get = type => sections.find(section => section.type === type)
  const hero = get('hero')
  const about = get('about')
  const services = get('services')
  const projects = get('projects')
  const clients = get('clients')
  const global = get('global')
  const contact = get('contact')
  const { theme, contact: details } = portfolio
  const regions = ['GCC', 'Europe', 'Africa', 'United States', 'Southeast Asia']

  async function share() {
    const url = window.location.href
    if (navigator.share) await navigator.share({ title: portfolio.title, url })
    else {
      await navigator.clipboard.writeText(url)
      window.dispatchEvent(new CustomEvent('standout:toast', { detail: 'Portfolio link copied' }))
    }
  }

  function renderSection(section) {
    switch (section.type) {
      case 'hero':
        return <section id="top" className="hero-section" key={section.id}><div className="hero-image"><img src={section.image} alt={section.imageAlt || 'Standout exhibition stand'} fetchPriority="high" /></div><div className="hero-shade" /><div className="hero-content"><p className="hero-kicker"><span /> {section.eyebrow}</p><h1>{section.title}</h1><p className="hero-description">{section.body}</p><div className="hero-actions"><a className="button button-light" href="#work">{section.primaryLabel || 'Explore our work'} <ArrowDown size={16} /></a><a className="hero-contact-link" href="#contact">{section.secondaryLabel || 'Start a conversation'} <ArrowUpRight size={16} /></a></div></div><div className="hero-index"><span>01</span><i /> A creative production partner</div><div className="hero-scroll">SCROLL TO EXPLORE <span /></div></section>
      case 'about':
        return <section id="about" className="about-section section-pad" key={section.id}><div className="about-image"><img src={section.image || '/media/p16-01.jpg'} alt={section.imageAlt || 'A calm, modern interior fit-out'} loading="lazy" /><span className="image-note">{section.imageCaption || 'Design · Build · Experience'}</span></div><div className="about-copy"><SectionHeading section={section} /><p className="about-description">We bring creative thinking and hands-on delivery together. Every project is a chance to help a brand connect with people — through spaces that feel considered, work beautifully and stay with you.</p><a className="text-link" href="#services">A little more about what we do <ArrowRight size={16} /></a><div className="about-stamp"><span>STANDOUT</span><small>Exhibitions, Events<br />& Interiors</small></div></div></section>
      case 'services':
        return <section id="services" className="services-section section-pad" key={section.id}><div className="section-head-row"><SectionHeading section={section} /></div><div className="services-grid">{portfolio.services.map((service, index) => <article className="service-card" key={`${service.title}-${index}`}><div className="service-image"><img src={service.image} alt={service.imageAlt || service.title} loading="lazy" /></div><div className="service-info"><h3>{service.title}</h3><p>{service.description || serviceNotes[index % serviceNotes.length]}</p><ArrowUpRight size={17} /></div></article>)}</div></section>
      case 'projects':
        return <section id="work" className="work-section section-pad" key={section.id}><div className="work-intro"><div className="work-heading"><span className="work-index">STANDOUT · SELECTED PROJECTS</span><SectionHeading section={section} /></div><div className="work-intro-aside"><span>Spaces that bring brands to life.</span><p>From the first sketch to the final detail, explore the environments we create for people to experience.</p><a href="#contact">Let’s create something memorable <ArrowUpRight size={15} /></a></div></div><ProjectGallery projects={portfolio.projects} onSelect={setActiveProject} /><div className="work-endnote"><span>Good work comes from good collaboration.</span><a href="#contact">Have a project in mind? <ArrowUpRight size={15} /></a></div></section>
      case 'clients':
        return <section className="clients-section section-pad" key={section.id}><div className="clients-heading"><SectionHeading section={section} /><p>The company profile features these brands across its portfolio.</p></div><div className="clients-grid">{portfolio.clients.map((client, index) => <div className="client-logo" key={`${client.name}-${index}`}><img src={client.image} alt={client.imageAlt || client.name} loading="lazy" /></div>)}</div><p className="client-note">Selected names and marks shown as presented in the company profile.</p></section>
      case 'global':
        return <section className="global-section section-pad" key={section.id}><div className="global-top"><div><SectionHeading section={section} /></div><div className="global-orbit"><div className="orbit-line orbit-line-one" /><div className="orbit-line orbit-line-two" /><div className="orbit-core"><Globe2 size={42} strokeWidth={1.2} /><span>WORLD<br />WIDE</span></div><i className="orbit-dot dot-one" /><i className="orbit-dot dot-two" /><i className="orbit-dot dot-three" /><i className="orbit-dot dot-four" /></div></div><div className="region-list">{regions.map((region, index) => <div key={region}><span>0{index + 1}</span><strong>{region}</strong><ArrowUpRight size={16} /></div>)}</div></section>
      case 'contact':
        return <section id="contact" className="contact-section section-pad" key={section.id}><div className="contact-intro"><SectionHeading section={section} /><p className="contact-direct-copy">We’d be glad to hear about your next exhibition, event or interior project.</p><a className="contact-email" href={`mailto:${details.email}`}>{details.email}<ArrowUpRight size={17} /></a><p className="contact-phone"><a href={`tel:${details.phone.replaceAll(' ', '')}`}>{details.phone}</a><span> / </span><a href={`tel:${details.mobile.replaceAll(' ', '')}`}>{details.mobile}</a></p><a className="whatsapp-link" href={`https://wa.me/${details.whatsapp}`} target="_blank" rel="noreferrer">Chat on WhatsApp <ArrowUpRight size={14} /></a></div><div className="office-locations"><div className="office-locations-heading"><Brand light logo={portfolio.brandLogo} alt={portfolio.brandLogoAlt || 'Standout logo'} /><div className="office-locations-label"><span>OUR LOCATIONS</span><p>Local knowledge. A global outlook.</p></div></div>{details.offices.map((office, index) => <a className="office-card" key={office.name} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${office.name} ${office.address}`)}`} target="_blank" rel="noreferrer" aria-label={`Find ${office.name} office on Google Maps`}><img className="office-card-image" src={officeImages[index % officeImages.length]} alt="" loading="lazy" /><div className="office-card-pin"><MapPin size={17} /></div><div className="office-card-copy"><small>0{index + 1} · STANDOUT OFFICE</small><h3>{office.name}</h3><p>{office.address}</p></div><ArrowUpRight className="office-card-arrow" size={17} /></a>)}</div></section>
      default:
        return null
    }
  }

  return (
    <div className="portfolio-site" style={{ '--brand': theme?.primary || '#5834a4', '--paper': theme?.paper || '#f8f7f5', '--ink': theme?.ink || '#201d25' }}>
      <header className="site-header">
        <a href="#top" className="header-brand" aria-label="Standout home"><Brand logo={portfolio.brandLogo} alt={portfolio.brandLogoAlt || 'Standout logo'} /></a>
        <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'} aria-label="Main navigation">
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#work" onClick={() => setMenuOpen(false)}>Selected work</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <div className="header-actions">
          <button className="header-share" onClick={() => printPortfolio(portfolio)}>PDF <FileDown size={15} /></button>
          <button className="header-share" onClick={share}>Share <ArrowUpRight size={15} /></button>
          <button className="menu-toggle" onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>
      {sections.map(renderSection)}
      <footer className="site-footer"><Link to="/" className="footer-brand"><Brand light logo={portfolio.brandLogo} alt={portfolio.brandLogoAlt || 'Standout logo'} /></Link><span>Exhibitions, Events & Interiors</span><span>© {new Date().getFullYear()} Standout</span><a href="https://www.standoutuae.com" target="_blank" rel="noreferrer">{details.website} <ArrowUpRight size={13} /></a></footer>
      {activeProject && <ProjectLightbox project={activeProject} onClose={() => setActiveProject(null)} />}
    </div>
  )
}

export default function PortfolioPage() {
  const { slug } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [state, setState] = useState('loading')
  const [toast, setToast] = useState('')
  useEffect(() => {
    let active = true
    api.publicPortfolio(slug || 'standout').then(result => {
      if (active) { setPortfolio(result.portfolio); setState('ready') }
    }).catch(() => { if (active) setState('unavailable') })
    return () => { active = false }
  }, [slug])
  useEffect(() => {
    const show = event => {
      setToast(event.detail)
      window.setTimeout(() => setToast(''), 2600)
    }
    window.addEventListener('standout:toast', show)
    return () => window.removeEventListener('standout:toast', show)
  }, [])
  if (state === 'loading') return <main className="loading-screen"><Brand /><span>Preparing the portfolio…</span></main>
  if (state === 'unavailable') return <main className="unavailable-screen"><Brand /><p className="eyebrow">PORTFOLIO UNAVAILABLE</p><h1>This portfolio isn’t published yet.</h1><p>Check the link with the person who shared it with you.</p><Link to="/" className="text-link"><ArrowLeft size={16} /> Return to the home page</Link></main>
  return <><ViewerContent portfolio={portfolio} />{toast && <div className="toast-message"><Check size={16} /> {toast}</div>}</>
}
