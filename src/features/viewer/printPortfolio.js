function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
}

function image(url, alt, className = '') {
  if (!url) return ''
  return `<img class="${className}" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">`
}

export function printPortfolio(portfolio) {
  const sections = portfolio.sections.filter(section => section.visible)
  const brand = portfolio.brandLogo
    ? image(portfolio.brandLogo, portfolio.brandLogoAlt || 'Standout logo', 'brand-logo')
    : '<div class="brand">standout<span>.</span></div>'
  const heading = section => `<p class="eyebrow">${escapeHtml(section.eyebrow || '')}</p><h2>${escapeHtml(section.title)}</h2><p class="lead">${escapeHtml(section.body || '')}</p>`
  const blocks = sections.map(section => {
    if (section.type === 'hero') return `<section class="cover">${image(section.image, 'Standout exhibition project')}<div class="cover-copy">${brand}<p class="eyebrow">${escapeHtml(section.eyebrow)}</p><h1>${escapeHtml(section.title)}</h1><p>${escapeHtml(section.body)}</p></div></section>`
    if (section.type === 'services') return `<section class="page">${heading(section)}<div class="services">${portfolio.services.map((service, index) => `<article>${image(service.image, service.imageAlt || service.title)}<small>0${index + 1}</small><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.description || '')}</p></article>`).join('')}</div></section>`
    if (section.type === 'projects') return `<section class="page"><div class="section-title">${heading(section)}</div><div class="projects">${portfolio.projects.map(project => `<article>${image(project.image, project.imageAlt || project.title)}<small>${escapeHtml(project.category || 'Selected work')}</small><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.location || '')}</p></article>`).join('')}</div></section>`
    if (section.type === 'clients') return `<section class="page">${heading(section)}<div class="clients">${portfolio.clients.map(client => image(client.image, client.imageAlt || client.name)).join('')}</div></section>`
    if (section.type === 'about') return `<section class="page split">${image(section.image, 'Standout company project')}<div>${heading(section)}</div></section>`
    if (section.type === 'contact') return `<section class="page contact">${heading(section)}<p>${escapeHtml(portfolio.contact.email)} · ${escapeHtml(portfolio.contact.phone)}</p><p>${escapeHtml(portfolio.contact.marketingEmail)} · ${escapeHtml(portfolio.contact.mobile)}</p>${portfolio.contact.offices.map(office => `<p><strong>${escapeHtml(office.name)}</strong><br>${escapeHtml(office.address)}</p>`).join('')}</section>`
    return `<section class="page">${heading(section)}</section>`
  }).join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(portfolio.title)}</title><style>
    @page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#24212a;font:13px Arial,sans-serif}.cover{height:265mm;position:relative;overflow:hidden;background:#211c2b;color:#fff;page-break-after:always}.cover>img{width:100%;height:100%;object-fit:cover;opacity:.65}.cover:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(18,14,24,.82),transparent)}.cover-copy{position:absolute;z-index:1;left:15mm;bottom:25mm;max-width:145mm}.brand{font-size:27px;font-weight:800;letter-spacing:-2px;margin-bottom:30mm}.brand span{color:#a990ec}.brand-logo{display:block;max-width:58mm;max-height:18mm;object-fit:contain;object-position:left center;margin-bottom:30mm}.eyebrow{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#6743b7}.cover .eyebrow{color:#d0c0ff}.cover h1{font:46px Georgia,serif;line-height:1.04;margin:12px 0}.cover-copy>p:last-child{font-size:14px;line-height:1.7;max-width:105mm}.page{page-break-before:always;min-height:250mm;padding:9mm 0}.page h2{font:34px Georgia,serif;line-height:1.12;margin:10px 0}.lead{max-width:125mm;color:#69636d;line-height:1.7}.services{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px}.services article,.projects article{break-inside:avoid}.services img,.projects img{width:100%;height:48mm;object-fit:cover}.services h3,.projects h3{margin:7px 0 3px;font-size:15px}.services p,.projects p{color:#6e6870;font-size:11px;line-height:1.5}.services small,.projects small{display:block;color:#6743b7;margin-top:8px}.projects{display:grid;grid-template-columns:1fr 1fr;gap:17px;margin-top:24px}.clients{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:28px}.clients img{width:100%;height:26mm;object-fit:contain;padding:7px;border:1px solid #eee}.split{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center}.split>img{width:100%;height:175mm;object-fit:cover}.contact{background:#24212a;color:white;padding:25mm;margin:0 -16mm}.contact h2{color:white}.contact .lead,.contact .eyebrow{color:#c6bbdb}.contact p{line-height:1.7}footer{position:fixed;bottom:0;left:0;right:0;font-size:8px;color:#8a8490;border-top:1px solid #ddd;padding-top:5px}
    @media print{.page{page-break-inside:avoid}.cover{page-break-after:always}.projects article,.services article{break-inside:avoid}}
  </style></head><body>${blocks}<footer>STANDOUT · EXHIBITIONS, EVENTS & INTERIORS · ${escapeHtml(portfolio.contact.website)}</footer><script>window.onload=async()=>{const imgs=[...document.images];await Promise.race([Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true})}))),new Promise(resolve=>setTimeout(resolve,5000))]);window.print()}</script></body></html>`
  const popup = window.open('', '_blank')
  if (!popup) throw new Error('Allow pop-ups to open the print-ready portfolio.')
  popup.opener = null
  popup.document.open()
  popup.document.write(html)
  popup.document.close()
}
