import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDown, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, Copy,
  Eye, EyeOff, FileDown, Globe2, ImagePlus, LayoutDashboard, LogOut, Monitor, Plus, RotateCcw,
  MapPin, Save, Settings2, Share2, Smartphone, Tablet, Trash2, Upload, X,
} from 'lucide-react'
import { api } from '../../lib/api.js'
import { printPortfolio } from '../viewer/printPortfolio.js'

const sectionNames = {
  hero: 'Hero', about: 'About the company', services: 'Services', projects: 'Selected work',
  clients: 'Clients', global: 'Global presence', contact: 'Contact',
}
const newSectionTypes = [
  { type: 'about', title: 'About the company', eyebrow: 'A little about us' },
  { type: 'services', title: 'Our services', eyebrow: 'What we do' },
  { type: 'projects', title: 'Selected work', eyebrow: 'Made to stand out' },
  { type: 'clients', title: 'Our clients', eyebrow: 'In good company' },
  { type: 'global', title: 'Global presence', eyebrow: 'Our reach' },
  { type: 'contact', title: 'Contact', eyebrow: 'Start a conversation' },
]

function Brand({ light = false, logo, alt = 'Standout logo' }) {
  if (logo) return <img className={`brand-logo-image${light ? ' brand-logo-light' : ''}`} src={logo} alt={alt} />
  return <span className={`brand-mark${light ? ' brand-mark-light' : ''}`}><span className="brand-word">standout<span>.</span></span><small className="brand-tagline">EXHIBITIONS · EVENTS · INTERIORS</small></span>
}

function AuthForm({ setup, onComplete }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (setup) await api.createAccount(email, password)
      else await api.login(email, password)
      onComplete(email)
    } catch (reason) {
      setError(reason.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-visual"><img src="/media/p07-04.jpg" alt="Standout exhibition design" /><div className="auth-visual-overlay" /><Link to="/" className="auth-brand"><Brand light /></Link><div className="auth-image-note"><span>CREATE SPACES</span><strong>That bring brands<br />to life.</strong></div><div className="auth-visual-footer">STANDOUT · EXHIBITIONS, EVENTS & INTERIORS</div></div>
      <div className="auth-panel"><div className="auth-topline"><span>PORTFOLIO STUDIO</span><Link to="/">Back to portfolio <ArrowUpRight size={14} /></Link></div><div className="auth-form-wrap"><p className="eyebrow">{setup ? 'FIRST-TIME SETUP' : 'EDITOR ACCESS'}</p><h1>{setup ? 'Make this space yours.' : 'Welcome back.'}</h1><p className="auth-intro">{setup ? 'Create your private editor account. Your credentials are stored securely on this server.' : 'Sign in to manage your portfolio and published work.'}</p><form onSubmit={submit}><label>Email address<input value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" required placeholder="you@standoutuae.com" /></label><label>Password<input value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete={setup ? 'new-password' : 'current-password'} minLength={setup ? 12 : 1} required placeholder={setup ? 'At least 12 characters' : 'Your password'} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button disabled={busy} className="button button-purple auth-submit">{busy ? 'Please wait…' : setup ? 'Create editor account' : 'Sign in'} <ArrowRight size={16} /></button></form><p className="auth-security"><span /> Your editor session is private and protected.</p></div><div className="auth-bottom">Questions about access? <a href="mailto:info@standoutuae.com">Contact Standout</a></div></div>
    </main>
  )
}

function EditorHeader({ email, status, logo, onLogout }) {
  return <header className="editor-header"><Link to="/admin/dashboard" className="editor-brand"><Brand logo={logo} /><span>PORTFOLIO STUDIO</span></Link><div className="editor-header-right"><span className={`publish-badge ${status === 'published' ? 'is-published' : ''}`}><i />{status === 'published' ? 'Published' : 'Draft'}</span><span className="editor-user">{email}</span><button className="icon-button" onClick={onLogout} aria-label="Sign out"><LogOut size={17} /></button></div></header>
}

function Dashboard({ portfolio, onEdit, onPublish, onUnpublish, busy, onExport }) {
  const published = portfolio.status === 'published'
  return <div className="dashboard-page"><div className="dashboard-top"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Good work starts here.</h1><p>Keep your portfolio fresh, considered and ready to share.</p></div><button className="button button-purple" onClick={onEdit}>Open editor <ArrowRight size={16} /></button></div><div className="dashboard-stats"><div><span>PORTFOLIO STATUS</span><strong className={published ? 'stat-published' : ''}>{published ? 'Published' : 'Draft'}</strong><small>{published ? 'Visible to anyone with the link' : 'Only visible in your editor'}</small></div><div><span>SECTIONS</span><strong>{portfolio.sections.filter(section => section.visible).length}<small> / {portfolio.sections.length}</small></strong><small>Visible on your portfolio</small></div><div><span>PROJECTS</span><strong>{portfolio.projects.length}</strong><small>Selected projects in your portfolio</small></div><div><span>MEDIA</span><strong>{portfolio.projects.reduce((sum, item) => sum + (item.gallery?.length || 1), 0)}</strong><small>Project images</small></div></div><section className="dashboard-portfolio"><div className="dashboard-preview-image"><img src={portfolio.sections.find(section => section.type === 'hero')?.image} alt="" /><span className="dashboard-preview-pill"><i /> {published ? 'LIVE' : 'IN PROGRESS'}</span></div><div className="dashboard-preview-copy"><div><p className="eyebrow">YOUR PORTFOLIO</p><h2>{portfolio.title}</h2><p>Curate the story of Standout — from the first introduction to the final project detail.</p>  <div className="dashboard-actions"><button className="button button-dark" onClick={onEdit}>Edit portfolio <ArrowRight size={16} /></button><button className="button button-outline" onClick={() => onExport(portfolio)}><FileDown size={16} /> Export PDF</button></div></div><div className="publish-card"><div className="publish-card-icon"><Globe2 size={19} /></div><strong>{published ? 'Your portfolio is live.' : 'Ready when you are.'}</strong><p>{published ? 'Share your link with clients, collaborators and your team.' : 'Save your edits and publish whenever you’re happy with the story.'}</p>{published ? <div className="publish-actions"><a className="text-link" href={`/portfolio/${portfolio.slug}`} target="_blank" rel="noreferrer">View live portfolio <ArrowUpRight size={15} /></a><button className="text-link" onClick={onUnpublish}>Unpublish</button></div> : <button className="button button-purple" disabled={busy} onClick={onPublish}>Publish portfolio <ArrowUpRight size={15} /></button>}</div></div></section><div className="dashboard-footnote">Draft edits stay private until you publish them. Your live link always shows the last published version.</div></div>
}

function PreviewCanvas({ portfolio, section, device, onDevice }) {
  const sectionTypes = {
    hero: 'canvas-preview-hero',
    about: 'canvas-preview-about',
    services: 'canvas-preview-services',
    projects: 'canvas-preview-projects',
    clients: 'canvas-preview-clients',
    global: 'canvas-preview-global',
    contact: 'canvas-preview-contact',
  }
  const previewClass = sectionTypes[section.type] || 'canvas-preview-default'
  const previewImage = section.image || (section.type === 'hero' ? '/media/p07-03.jpg' : '/media/p16-01.jpg')
  return (
    <div className={`preview-area preview-${device}`}>
      <div className="preview-toolbar">
        <div className="preview-mode">
          <button onClick={() => onDevice('desktop')} className={device === 'desktop' ? 'selected' : ''} aria-label="Desktop preview"><Monitor size={15} /></button>
          <button onClick={() => onDevice('tablet')} className={device === 'tablet' ? 'selected' : ''} aria-label="Tablet preview"><Tablet size={15} /></button>
          <button onClick={() => onDevice('mobile')} className={device === 'mobile' ? 'selected' : ''} aria-label="Mobile preview"><Smartphone size={15} /></button>
        </div>
        <span>LIVE PREVIEW</span>
        <button className="preview-open" title="Open public portfolio" onClick={() => window.open(`/portfolio/${portfolio.slug}`, '_blank', 'noopener')}><ArrowUpRight size={15} /></button>
      </div>
      <div className="preview-scroll">
        {section.type === 'hero' && <div className={`canvas-section canvas-hero ${previewClass}`}>
          <img src={previewImage} alt="" /><div className="canvas-overlay" />
          <div className="canvas-brandbar"><Brand light logo={portfolio.brandLogo} alt={portfolio.brandLogoAlt || 'Standout logo'} /><div className="canvas-nav-preview"><span>ABOUT</span><span>SERVICES</span><span>SELECTED WORK</span></div></div>
          <div className="canvas-content"><span>{section.eyebrow}</span><strong>{section.title}</strong><p>{section.body}</p><i>{section.primaryLabel || 'Explore our work'}　↗</i></div>
        </div>}
        {section.type === 'about' && <div className={`canvas-about ${previewClass}`}>
          <div className="canvas-about-image"><img src={previewImage} alt={section.imageAlt || ''} /><span>{section.imageCaption || 'DESIGN · BUILD · EXPERIENCE'}</span></div>
          <div className="canvas-about-copy"><span>{section.eyebrow}</span><strong>{section.title}</strong><p>{section.body}</p><small>CREATIVE THINKING · HANDS-ON DELIVERY</small></div>
        </div>}
        {section.type === 'services' && <div className={`canvas-section-content ${previewClass}`}>
          <div className="canvas-section-heading"><span>{section.eyebrow}</span><strong>{section.title}</strong><p>{section.body}</p></div>
          <div className="canvas-service-grid">{portfolio.services.slice(0, 6).map((service, index) => <article key={`${service.title}-${index}`}><img src={service.image} alt="" /><strong>{service.title}</strong><p>{service.description}</p></article>)}</div>
        </div>}
        {section.type === 'projects' && <div className={`canvas-section-content ${previewClass}`}>
          <div className="canvas-project-heading"><div><span>{section.eyebrow}</span><strong>{section.title}</strong><p>{section.body}</p></div><small>STANDOUT · SELECTED PROJECTS</small></div>
          <div className="canvas-project-filters"><span>ALL WORK</span><span>EXHIBITION STANDS</span><span>INTERIORS</span></div>
          <div className="canvas-project-grid">{portfolio.projects.slice(0, 4).map((project, index) => <article className={`canvas-project-card canvas-project-card-${index % 2}`} key={project.id}><img src={project.image} alt="" /><div><small>{project.category || 'Selected work'}</small><strong>{project.title}</strong></div></article>)}</div>
        </div>}
        {section.type === 'clients' && <div className={`canvas-clients-preview ${previewClass}`}>
          <div className="canvas-clients-copy"><span>{section.eyebrow}</span><strong>{section.title}</strong><p>{section.body}</p><small>The company profile features these brands across its portfolio.</small></div>
          <div className="canvas-clients-logos">{portfolio.clients.map((client, index) => <div key={`${client.name}-${index}`}><img src={client.image} alt={client.imageAlt || client.name} /></div>)}</div>
          <p className="canvas-clients-note">Selected names and marks shown as presented in the company profile.</p>
        </div>}
        {section.type === 'global' && <div className={`canvas-section-content ${previewClass}`}>
          <div className="canvas-global-heading"><span>{section.eyebrow}</span><strong>{section.title}</strong><p>{section.body}</p></div>
          <div className="canvas-global-orbit"><div /><div /><div /><Globe2 size={40} /><span>GLOBAL<br />REACH</span><i>UAE</i><i>EUROPE</i><i>ASIA</i><i>AFRICA</i></div>
          <div className="canvas-global-regions">{['GCC', 'Europe', 'Africa', 'United States', 'Southeast Asia'].map((region, index) => <span key={region}><small>0{index + 1}</small>{region}<ArrowUpRight size={12} /></span>)}</div>
        </div>}
        {section.type === 'contact' && <div className={`canvas-section-content ${previewClass}`}>
          <div className="canvas-contact-copy"><span>{section.eyebrow}</span><strong>{section.title}</strong><p>{section.body}</p><b>info@standoutuae.com</b><small>+971 4 589 7752　·　+971 56 919 1407</small></div>
          <div className="canvas-contact-offices">{(portfolio.contact?.offices || []).map((office, index) => <article key={office.name}><MapPin size={15} /><div><small>0{index + 1} · STANDOUT OFFICE</small><strong>{office.name}</strong><p>{office.address}</p></div></article>)}</div>
        </div>}
        {!sectionTypes[section.type] && <div className={`canvas-section canvas-default ${previewClass}`}><img src={previewImage} alt="" /><div className="canvas-overlay" /><div className="canvas-content"><span>{section.eyebrow}</span><strong>{section.title}</strong><p>{section.body}</p></div></div>}
        <div className="canvas-caption"><span>{sectionNames[section.type] || section.title}</span><span>Changes appear instantly</span></div>
      </div>
    </div>
  )
}

function Inspector({ portfolio, section, onSection, onProject, onService, onClient, onContact, onTheme, onBrandLogo, onBrandLogoUpload, onUpload, onSetImage, media, uploadBusy, selectedProjectId, onSelectProject, onAddProject, onRemoveProject, onMoveProject, selectedServiceIndex, onSelectService, onRemoveService, onMoveService, selectedClientIndex, onSelectClient, onRemoveClient, onMoveClient }) {
  const [search, setSearch] = useState('')
  const [mediaOpen, setMediaOpen] = useState(false)
  const [logoPickerOpen, setLogoPickerOpen] = useState(false)
  const filteredMedia = media.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
  const field = (label, key, multiline = false) => <label className="inspector-field">{label}{multiline ? <textarea rows={4} value={section[key] || ''} onChange={event => onSection({ ...section, [key]: event.target.value })} /> : <input value={section[key] || ''} onChange={event => onSection({ ...section, [key]: event.target.value })} />}</label>
  return <aside className="inspector-panel"><div className="inspector-title"><div><p className="eyebrow">SECTION SETTINGS</p><h2>{sectionNames[section.type] || 'Section'}</h2></div><Settings2 size={18} /></div><div className="inspector-scroll">  <div className="inspector-group"><h3>Company logo</h3><div className="brand-logo-preview">{portfolio.brandLogo ? <img src={portfolio.brandLogo} alt={portfolio.brandLogoAlt || 'Company logo'} /> : <Brand />}</div><label className="inspector-field">Logo alt text<input value={portfolio.brandLogoAlt || ''} onChange={event => onBrandLogo({ ...portfolio, brandLogoAlt: event.target.value })} /></label><div className="logo-actions"><label className="upload-button"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={onBrandLogoUpload} /><Upload size={15} />Upload / replace</label><button className="small-action" onClick={() => setLogoPickerOpen(value => !value)}><ImagePlus size={14} /> Choose media</button>{portfolio.brandLogo && <button className="small-action small-danger" onClick={() => onBrandLogo({ ...portfolio, brandLogo: '' })}><Trash2 size={13} /> Remove</button>}</div>{logoPickerOpen && <div className="media-picker"><input placeholder="Search media" value={search} onChange={event => setSearch(event.target.value)} /><div className="media-grid">{filteredMedia.map(item => <button key={item.url} onClick={() => { onBrandLogo({ ...portfolio, brandLogo: item.url, brandLogoAlt: item.name }); setLogoPickerOpen(false) }}><img src={item.url} alt={item.name} /></button>)}</div></div>}<small className="field-note">Use a transparent PNG or a JPEG/WebP logo. Your logo updates in the header and footer.</small></div><div className="inspector-fields">{field('Eyebrow', 'eyebrow')}{field('Heading', 'title')}{field('Description', 'body', true)}</div>
    {(section.image !== undefined || ['projects', 'services', 'clients'].includes(section.type)) && <div className="inspector-group"><h3>{['projects', 'services', 'clients'].includes(section.type) ? 'Selected item image' : 'Section image'}</h3><div className="inspector-image"><img src={section.type === 'projects' ? portfolio.projects.find(item => item.id === selectedProjectId)?.image : section.type === 'services' ? portfolio.services[selectedServiceIndex]?.image : section.type === 'clients' ? portfolio.clients[selectedClientIndex]?.image : section.image || '/media/p10-04.jpg'} alt="" /><button title="Choose image" onClick={() => setMediaOpen(value => !value)}><ImagePlus size={16} /></button></div>{mediaOpen && <div className="media-picker"><input placeholder="Search media" value={search} onChange={event => setSearch(event.target.value)} /><div className="media-grid">{filteredMedia.map(item => <button key={item.url} onClick={() => { onSetImage(item.url); setMediaOpen(false) }}><img src={item.url} alt={item.name} /></button>)}</div></div>}<label className="upload-button"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple onChange={onUpload} /><Upload size={15} />{uploadBusy ? 'Uploading…' : 'Upload images'}</label><small className="field-note">JPEG, PNG, WebP or AVIF · Up to 12 MB each</small></div>}
    {section.image !== undefined && section.type !== 'projects' && section.type !== 'services' && section.type !== 'clients' && <><label className="inspector-field">Image alt text<input value={section.imageAlt || ''} onChange={event => onSection({ ...section, imageAlt: event.target.value })} /></label>{section.type === 'about' && <label className="inspector-field">Image caption<input value={section.imageCaption || ''} onChange={event => onSection({ ...section, imageCaption: event.target.value })} /></label>}</>}
    {section.type === 'hero' && <div className="inspector-group"><h3>Call-to-action buttons</h3><label className="inspector-field">Primary button label<input value={section.primaryLabel || ''} onChange={event => onSection({ ...section, primaryLabel: event.target.value })} /></label><label className="inspector-field">Secondary button label<input value={section.secondaryLabel || ''} onChange={event => onSection({ ...section, secondaryLabel: event.target.value })} /></label></div>}
    {section.type === 'projects' && <ProjectInspector projects={portfolio.projects} selectedId={selectedProjectId} onSelect={onSelectProject} onProject={onProject} onAdd={onAddProject} onRemove={onRemoveProject} onMove={onMoveProject} />}
    {section.type === 'services' && <ServicesInspector services={portfolio.services} selectedIndex={selectedServiceIndex} onSelect={onSelectService} onService={onService} onRemove={onRemoveService} onMove={onMoveService} />}
    {section.type === 'clients' && <ClientsInspector clients={portfolio.clients} selectedIndex={selectedClientIndex} onSelect={onSelectClient} onClient={onClient} onRemove={onRemoveClient} onMove={onMoveClient} />}
    {section.type === 'contact' && <ContactInspector details={portfolio.contact} onChange={onContact} />}
    <div className="inspector-group"><h3>Brand colour</h3><label className="color-control"><span>Primary colour</span><input type="color" value={portfolio.theme.primary} onChange={event => onTheme({ ...portfolio.theme, primary: event.target.value })} /></label></div>
    <div className="inspector-group"><h3>Section visibility</h3><button className="visibility-control" onClick={() => onSection({ ...section, visible: !section.visible })}>{section.visible ? <Eye size={16} /> : <EyeOff size={16} />}{section.visible ? 'Visible on portfolio' : 'Hidden from portfolio'}<ChevronDown size={14} /></button></div>
  </div></aside>
}

function Editor({ portfolio: initial, onSave, onPublish, busy, onBack, onExport }) {
  const [portfolio, setPortfolio] = useState(initial)
  const [selectedId, setSelectedId] = useState(initial.sections[0]?.id)
  const [device, setDevice] = useState('desktop')
  const [media, setMedia] = useState([])
  const [uploadBusy, setUploadBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [dirty, setDirty] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState(initial.projects[0]?.id)
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)
  const [activeClientIndex, setActiveClientIndex] = useState(0)
  const selected = portfolio.sections.find(section => section.id === selectedId) || portfolio.sections[0]

  useEffect(() => {
    api.media().then(result => setMedia(result.media)).catch(error => setNotice(error.message))
  }, [])

  function update(patch) {
    setPortfolio(current => ({ ...current, ...patch }))
    setDirty(true)
  }
  function updateSection(section) {
    update({ sections: portfolio.sections.map(item => item.id === section.id ? section : item) })
  }
  function reorder(index, direction) {
    const next = [...portfolio.sections]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    update({ sections: next })
  }
  function moveSection(sourceId, targetId) {
    if (sourceId === targetId) return
    const from = portfolio.sections.findIndex(section => section.id === sourceId)
    const to = portfolio.sections.findIndex(section => section.id === targetId)
    if (from < 0 || to < 0) return
    const next = [...portfolio.sections]
    next.splice(to, 0, next.splice(from, 1)[0])
    update({ sections: next })
  }
  function addSection(type) {
    const definition = newSectionTypes.find(item => item.type === type)
    if (!definition) return
    const section = { ...definition, id: `${type}-${crypto.randomUUID().slice(0, 8)}`, type, body: '', visible: true, image: type === 'about' ? '/media/p16-01.jpg' : undefined }
    update({ sections: [...portfolio.sections, section] })
    setSelectedId(section.id)
  }
  function duplicateSection(section) {
    const copy = { ...section, id: `${section.type}-${crypto.randomUUID().slice(0, 8)}`, title: `${section.title} copy` }
    update({ sections: [...portfolio.sections, copy] })
    setSelectedId(copy.id)
  }
  function removeSection(id) {
    if (portfolio.sections.length <= 1) return
    const next = portfolio.sections.filter(section => section.id !== id)
    update({ sections: next })
    if (selectedId === id) setSelectedId(next[0].id)
  }
  function updateProject(project) {
    update({ projects: portfolio.projects.map(item => item.id === project.id ? project : item) })
  }
  function updateContact(contact) {
    update({ contact })
  }
  function updateService(index, service) {
    const services = [...portfolio.services]
    if (index === -1) services.push(service)
    else services[index] = service
    update({ services })
    if (index === -1) setActiveServiceIndex(services.length - 1)
  }
  function updateClient(index, client) {
    const clients = [...portfolio.clients]
    if (index === -1) clients.push(client)
    else clients[index] = client
    update({ clients })
    if (index === -1) setActiveClientIndex(clients.length - 1)
  }
  function removeProject(id) {
    const remaining = portfolio.projects.filter(project => project.id !== id)
    update({ projects: remaining })
    if (activeProjectId === id) setActiveProjectId(remaining[0]?.id)
  }
  function removeService(index) {
    update({ services: portfolio.services.filter((_, itemIndex) => itemIndex !== index) })
    setActiveServiceIndex(Math.max(0, Math.min(index, portfolio.services.length - 2)))
  }
  function removeClient(index) {
    update({ clients: portfolio.clients.filter((_, itemIndex) => itemIndex !== index) })
    setActiveClientIndex(Math.max(0, Math.min(index, portfolio.clients.length - 2)))
  }
  function moveRecord(records, index, direction, setter, activeIndex, fieldName) {
    const target = index + direction
    if (target < 0 || target >= records.length) return
    const next = [...records]
    const item = next[index]
    next[index] = next[target]
    next[target] = item
    update({ [fieldName]: next })
    if (activeIndex === index) setter(target)
    else if (activeIndex === target) setter(index)
  }
  function moveService(index, direction) {
    moveRecord(portfolio.services, index, direction, setActiveServiceIndex, activeServiceIndex, 'services')
  }
  function moveClient(index, direction) {
    moveRecord(portfolio.clients, index, direction, setActiveClientIndex, activeClientIndex, 'clients')
  }
  function moveProject(index, direction) {
    const target = index + direction
    if (target < 0 || target >= portfolio.projects.length) return
    const projects = [...portfolio.projects]
    const project = projects[index]
    projects[index] = projects[target]
    projects[target] = project
    update({ projects })
  }
  function addProject() {
    const project = { id: crypto.randomUUID(), title: 'New project', category: 'Exhibition stands', location: '', image: '/media/p04-01.jpg', gallery: ['/media/p04-01.jpg'] }
    update({ projects: [...portfolio.projects, project] })
    setActiveProjectId(project.id)
  }
  function setMediaImage(image) {
    if (selected.type === 'projects') {
      const project = portfolio.projects.find(item => item.id === activeProjectId)
      if (project) updateProject({ ...project, image, imageAlt: project.title, gallery: [image, ...(project.gallery || []).filter(item => item !== image)] })
    } else if (selected.type === 'services') {
      const service = portfolio.services[activeServiceIndex]
      if (service) updateService(activeServiceIndex, { ...service, image, imageAlt: service.title })
    } else if (selected.type === 'clients') {
      const client = portfolio.clients[activeClientIndex]
      if (client) updateClient(activeClientIndex, { ...client, image, imageAlt: client.name })
    } else updateSection({ ...selected, image })
  }
  async function uploadFiles(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return
    setUploadBusy(true)
    setNotice('')
    try {
      const result = await api.upload(files)
      setMedia(current => [...result.files, ...current])
      if (selected.type === 'projects' && portfolio.projects.find(item => item.id === activeProjectId)) {
        const project = portfolio.projects.find(item => item.id === activeProjectId)
        const gallery = [...(project.gallery || [project.image]), ...result.files.map(item => item.url)]
        updateProject({ ...project, gallery })
      } else if (selected.type === 'services') {
        const service = portfolio.services[activeServiceIndex]
        if (service) updateService(activeServiceIndex, { ...service, image: result.files[0].url, imageAlt: service.title })
      } else if (selected.type === 'clients') {
        const client = portfolio.clients[activeClientIndex]
        if (client) updateClient(activeClientIndex, { ...client, image: result.files[0].url, imageAlt: client.name })
      } else {
        updateSection({ ...selected, image: result.files[0].url })
      }
      setNotice(`${result.files.length} image${result.files.length === 1 ? '' : 's'} uploaded and saved.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setUploadBusy(false)
    }
  }
  async function uploadBrandLogo(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploadBusy(true)
    setNotice('')
    try {
      const result = await api.upload([file])
      setMedia(current => [...result.files, ...current])
      update({ brandLogo: result.files[0].url, brandLogoAlt: file.name.replace(/\.[^.]+$/, '') })
      setNotice('Company logo uploaded. Save your draft to keep this change.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setUploadBusy(false)
    }
  }
  async function save() {
    try {
      const result = await onSave(portfolio)
      setPortfolio(result)
      setDirty(false)
      setNotice('Draft saved.')
    } catch (error) {
      setNotice(error.message)
    }
  }
  async function publish() {
    try {
      if (dirty) {
        const saved = await onSave(portfolio)
        setPortfolio(saved)
        setDirty(false)
      }
      await onPublish()
      setNotice('Your latest changes are live.')
    } catch (error) {
      setNotice(error.message)
    }
  }
  async function exportDraft() {
    try {
      const saved = dirty ? await onSave(portfolio) : portfolio
      setPortfolio(saved)
      setDirty(false)
      onExport(saved)
    } catch (error) {
      setNotice(error.message)
    }
  }
  const publicLink = `${window.location.origin}/portfolio/${portfolio.slug}`
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicLink)
      setNotice('Client link copied.')
    } catch {
      setNotice(publicLink)
    }
  }
  const moveableSections = useMemo(() => portfolio.sections.map((section, index) => ({ section, index })), [portfolio.sections])

  return <div className="editor-page">
    <header className="editor-header"><button className="editor-back" onClick={onBack}><ArrowLeft size={17} /><span>Dashboard</span></button><div className="editor-title"><span>EDITING</span><strong>{portfolio.title}</strong></div><div className="editor-header-right"><button className="button button-outline button-compact" onClick={exportDraft}><FileDown size={15} /><span>Export PDF</span></button><button className="button button-outline button-compact" onClick={copyLink}><Share2 size={15} /><span>Share link</span></button><button className="button button-purple button-compact" disabled={busy} onClick={save}><Save size={15} />{busy ? 'Saving…' : 'Save draft'}</button><button className="button button-dark button-compact" disabled={busy} onClick={publish}><Globe2 size={15} />Publish</button></div></header>
    <div className="editor-workspace">
      <aside className="structure-panel"><div className="structure-heading"><div><p className="eyebrow">PAGE STRUCTURE</p><h2>Your story</h2></div><span>{portfolio.sections.length}</span></div><div className="section-tree">{moveableSections.map(({ section, index }) => <div key={section.id} draggable onDragStart={event => event.dataTransfer.setData('text/plain', section.id)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); moveSection(event.dataTransfer.getData('text/plain'), section.id) }} className={`section-tree-row${selectedId === section.id ? ' active' : ''}${!section.visible ? ' is-hidden' : ''}`}><button className="section-select" onClick={() => setSelectedId(section.id)}><span className="section-tree-icon">{sectionNames[section.type]?.slice(0, 1) || 'S'}</span><span>{sectionNames[section.type] || section.title}</span></button><div className="section-actions"><button onClick={() => reorder(index, -1)} title="Move up" disabled={index === 0}><ArrowUp size={13} /></button><button onClick={() => reorder(index, 1)} title="Move down" disabled={index === portfolio.sections.length - 1}><ArrowDown size={13} /></button></div></div>)}</div><details className="add-section"><summary><Plus size={16} /> Add a section</summary><div>{newSectionTypes.map(item => <button key={item.type} onClick={() => addSection(item.type)}><Plus size={13} /> {item.title}</button>)}</div></details><div className="structure-bottom"><span>Standout Portfolio</span><small>Save changes to keep your draft.</small></div></aside>
      <main className="editor-main"><PreviewCanvas portfolio={portfolio} section={selected} device={device} onDevice={setDevice} /><div className="editor-canvas-foot"><span>{selected.title}</span><div><button title="Duplicate section" onClick={() => duplicateSection(selected)}><Copy size={15} /></button><button title={selected.visible ? 'Hide section' : 'Show section'} onClick={() => updateSection({ ...selected, visible: !selected.visible })}>{selected.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button><button title="Delete section" onClick={() => removeSection(selected.id)}><Trash2 size={15} /></button></div></div>{notice && <div className="editor-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={14} /></button></div>}</main>
      <Inspector portfolio={portfolio} section={selected} onSection={updateSection} onProject={updateProject} onService={updateService} onClient={updateClient} onContact={updateContact} onTheme={theme => update({ theme })} onBrandLogo={next => update({ brandLogo: next.brandLogo, brandLogoAlt: next.brandLogoAlt })} onBrandLogoUpload={uploadBrandLogo} onUpload={uploadFiles} onSetImage={setMediaImage} media={media} uploadBusy={uploadBusy} selectedProjectId={activeProjectId} onSelectProject={setActiveProjectId} onAddProject={addProject} onRemoveProject={removeProject} onMoveProject={moveProject} selectedServiceIndex={activeServiceIndex} onSelectService={setActiveServiceIndex} onRemoveService={removeService} onMoveService={moveService} selectedClientIndex={activeClientIndex} onSelectClient={setActiveClientIndex} onRemoveClient={removeClient} onMoveClient={moveClient} />
    </div>
    {portfolio.status === 'published' && <div className="editor-publish-strip"><span><i /> Your portfolio is live</span><button onClick={copyLink}><Copy size={14} /> Copy client link</button><a href={`/portfolio/${portfolio.slug}`} target="_blank" rel="noreferrer">View published page <ArrowUpRight size={14} /></a></div>}
  </div>
}

function ProjectInspector({ projects, selectedId, onSelect, onProject, onAdd, onRemove, onMove }) {
  const project = projects.find(item => item.id === selectedId) || projects[0]
  function reorderImage(from, to) {
    const gallery = [...(project.gallery || [project.image])]
    if (to < 0 || to >= gallery.length) return
    const [image] = gallery.splice(from, 1)
    gallery.splice(to, 0, image)
    onProject({ ...project, image: gallery[0], imageAlt: project.title, imageCaption: '', gallery })
  }
  function removeImage(index) {
    const gallery = (project.gallery || [project.image]).filter((_, itemIndex) => itemIndex !== index)
    if (!gallery.length) return
    onProject({ ...project, image: gallery[0], imageAlt: project.title, imageCaption: '', gallery })
  }
  if (!project) return <div className="inspector-group"><div className="inspector-group-heading"><h3>Projects</h3><button className="small-action" onClick={onAdd}><Plus size={14} /> Add</button></div><p className="field-note">No projects yet. Add a project to start building your portfolio gallery.</p></div>
  const gallery = project.gallery?.length ? project.gallery : [project.image]
  return <div className="inspector-group"><div className="inspector-group-heading"><h3>Projects</h3><button className="small-action" onClick={onAdd}><Plus size={14} /> Add</button></div><div className="content-record-list">{projects.map((item, index) => <div key={item.id} className={`content-record-row${item.id === project.id ? ' active' : ''}`}><button className="content-record-select" onClick={() => onSelect(item.id)}>{item.title}<ArrowRight size={13} /></button><button className="record-order-button" onClick={() => onMove(index, -1)} disabled={index === 0} title="Move project up"><ArrowUp size={12} /></button><button className="record-order-button" onClick={() => onMove(index, 1)} disabled={index === projects.length - 1} title="Move project down"><ArrowDown size={12} /></button></div>)}</div><div className="record-heading"><h4>Selected project</h4><button className="small-action small-danger" onClick={() => onRemove(project.id)}><Trash2 size={13} /> Remove</button></div>{['title', 'category', 'location'].map(key => <label className="inspector-field" key={key}>{key[0].toUpperCase() + key.slice(1)}<input value={project[key] || ''} onChange={event => onProject({ ...project, [key]: event.target.value })} /></label>)}<label className="inspector-field">Cover image alt text<input value={project.imageAlt || ''} onChange={event => onProject({ ...project, imageAlt: event.target.value })} /></label><label className="inspector-field">Cover image caption<input value={project.imageCaption || ''} onChange={event => onProject({ ...project, imageCaption: event.target.value })} /></label><p className="field-note">Reorder images to choose the cover and first gallery image.</p><div className="gallery-order-list">{gallery.map((image, index) => <div key={`${image}-${index}`} draggable onDragStart={event => event.dataTransfer.setData('text/plain', String(index))} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); reorderImage(Number(event.dataTransfer.getData('text/plain')), index) }} className={index === 0 ? 'gallery-order-row is-cover' : 'gallery-order-row'}><img src={image} alt="" /><span>{index === 0 ? 'COVER' : `IMAGE ${index + 1}`}</span><button onClick={() => reorderImage(index, index - 1)} disabled={index === 0} title="Move image up"><ArrowUp size={12} /></button><button onClick={() => reorderImage(index, index + 1)} disabled={index === gallery.length - 1} title="Move image down"><ArrowDown size={12} /></button><button onClick={() => removeImage(index)} disabled={gallery.length === 1} title="Remove image"><Trash2 size={12} /></button></div>)}</div></div>
}

function ServicesInspector({ services, selectedIndex, onSelect, onService, onRemove, onMove }) {
  const service = services[selectedIndex]
  return <div className="inspector-group"><div className="inspector-group-heading"><h3>Services</h3><button className="small-action" onClick={() => onService(-1, { title: 'New service', description: '', image: '/media/p07-03.jpg', imageAlt: '' })}><Plus size={14} /> Add</button></div><div className="content-record-list">{services.map((item, index) => <div key={`${item.title}-${index}`} className={`content-record-row${selectedIndex === index ? ' active' : ''}`}><button className="content-record-select" onClick={() => onSelect(index)}>{item.title}<ArrowRight size={13} /></button><button className="record-order-button" onClick={() => onMove(index, -1)} disabled={index === 0} title="Move service up"><ArrowUp size={12} /></button><button className="record-order-button" onClick={() => onMove(index, 1)} disabled={index === services.length - 1} title="Move service down"><ArrowDown size={12} /></button></div>)}</div>{service && <><label className="inspector-field">Service name<input value={service.title || ''} onChange={event => onService(selectedIndex, { ...service, title: event.target.value })} /></label><label className="inspector-field">Description<textarea rows={3} value={service.description || ''} onChange={event => onService(selectedIndex, { ...service, description: event.target.value })} /></label><label className="inspector-field">Image alt text<input value={service.imageAlt || ''} onChange={event => onService(selectedIndex, { ...service, imageAlt: event.target.value })} /></label><div className="record-heading"><p className="field-note">Upload or choose media to replace this service image.</p><button className="small-action small-danger" onClick={() => onRemove(selectedIndex)}><Trash2 size={13} /> Remove</button></div></>}</div>
}

function ClientsInspector({ clients, selectedIndex, onSelect, onClient, onRemove, onMove }) {
  const client = clients[selectedIndex]
  return <div className="inspector-group"><div className="inspector-group-heading"><h3>Client logos</h3><button className="small-action" onClick={() => onClient(-1, { name: 'New client', image: '/media/p18-02.jpg', imageAlt: '' })}><Plus size={14} /> Add</button></div><div className="content-record-list">{clients.map((item, index) => <div key={`${item.name}-${index}`} className={`content-record-row${selectedIndex === index ? ' active' : ''}`}><button className="content-record-select" onClick={() => onSelect(index)}>{item.name}<ArrowRight size={13} /></button><button className="record-order-button" onClick={() => onMove(index, -1)} disabled={index === 0} title="Move logo up"><ArrowUp size={12} /></button><button className="record-order-button" onClick={() => onMove(index, 1)} disabled={index === clients.length - 1} title="Move logo down"><ArrowDown size={12} /></button></div>)}</div>{client && <><label className="inspector-field">Client name<input value={client.name || ''} onChange={event => onClient(selectedIndex, { ...client, name: event.target.value })} /></label><label className="inspector-field">Logo alt text<input value={client.imageAlt || ''} onChange={event => onClient(selectedIndex, { ...client, imageAlt: event.target.value })} /></label><div className="record-heading"><p className="field-note">Upload or choose media to replace this client logo.</p><button className="small-action small-danger" onClick={() => onRemove(selectedIndex)}><Trash2 size={13} /> Remove</button></div></>}</div>
}

function ContactInspector({ details, onChange }) {
  const update = (key, value) => onChange({ ...details, [key]: value })
  return <div className="inspector-group"><h3>Company contact details</h3>{['email', 'marketingEmail', 'phone', 'mobile', 'whatsapp', 'website'].map(key => <label className="inspector-field" key={key}>{({ marketingEmail: 'Marketing email', whatsapp: 'WhatsApp number' }[key] || key[0].toUpperCase() + key.slice(1))}<input value={details[key] || ''} onChange={event => update(key, event.target.value)} /></label>)}{details.offices.map((office, index) => <div key={office.name} className="office-edit"><label className="inspector-field">Office name<input value={office.name} onChange={event => update('offices', details.offices.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} /></label><label className="inspector-field">Address<textarea rows={2} value={office.address} onChange={event => update('offices', details.offices.map((item, i) => i === index ? { ...item, address: event.target.value } : item))} /></label></div>)}</div>
}

export default function AdminPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [setup, setSetup] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [portfolio, setPortfolio] = useState(null)
  const [busy, setBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const isEditor = location.pathname.endsWith('/edit')

  useEffect(() => {
    let active = true
    api.session().then(async result => {
      if (!active) return
      if (!result.authenticated) {
        const status = await api.setup()
        if (active) setSetup(status.needsSetup)
        return
      }
      setEmail(result.email)
      setAuthenticated(true)
      const data = await api.adminPortfolio()
      if (active) setPortfolio(data.portfolio)
    }).catch(() => {
      if (active) setAuthError('Could not connect to the editor service. Check the server and try again.')
    })
    return () => { active = false }
  }, [])

  async function signOut() {
    await api.logout()
    setAuthenticated(false)
    setPortfolio(null)
    navigate('/admin', { replace: true })
  }
  async function savePortfolio(next) {
    setBusy(true)
    try {
      const result = await api.savePortfolio(next)
      setPortfolio(result.portfolio)
      return result.portfolio
    } finally {
      setBusy(false)
    }
  }
  async function publish() {
    setBusy(true)
    try {
      const result = await api.publish()
      setPortfolio(result.portfolio)
      return result.portfolio
    } finally {
      setBusy(false)
    }
  }
  async function unpublish() {
    setBusy(true)
    try {
      const result = await api.unpublish()
      setPortfolio(result.portfolio)
    } finally {
      setBusy(false)
    }
  }
  function exportPdf(data = portfolio) {
    try { printPortfolio(data) } catch (error) { window.alert(error.message) }
  }

  if (!authenticated && authError) return <main className="loading-screen"><Brand /><p>{authError}</p><button className="button button-outline" onClick={() => window.location.reload()}>Try again</button></main>
  if (!authenticated) return <AuthForm setup={setup} onComplete={user => {
    setEmail(user)
    setAuthenticated(true)
    api.adminPortfolio().then(data => setPortfolio(data.portfolio)).catch(() => {})
  }} />
  if (!portfolio) return <main className="loading-screen"><Brand /><span>Loading your workspace…</span></main>
  if (isEditor) return <Editor portfolio={portfolio} onSave={savePortfolio} onPublish={publish} busy={busy} onBack={() => navigate('/admin/dashboard')} onExport={exportPdf} />
  return <div className="dashboard-shell"><EditorHeader email={email} status={portfolio.status} logo={portfolio.brandLogo} onLogout={signOut} /><Dashboard portfolio={portfolio} onEdit={() => navigate('/admin/portfolio/standout/edit')} onPublish={publish} onUnpublish={unpublish} busy={busy} onExport={exportPdf} /></div>
}
