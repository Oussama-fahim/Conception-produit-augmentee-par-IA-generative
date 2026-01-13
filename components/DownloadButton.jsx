"use client"

import React from 'react'

export default function DownloadButton({ href, filename, children, className = '' }) {
  if (!href) return null

  const baseClass = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm'

  const handleClick = async (e) => {
    e.preventDefault()
    const name = filename || href.split('/').pop().split('?')[0] || 'download'

    // data: URLs
    if (href.startsWith('data:')) {
      try {
        const res = await fetch(href)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = name
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
      } catch (err) {
        window.open(href, '_blank', 'noopener')
      }
      return
    }

    // Determine same-origin
    let isSameOrigin = false
    try {
      const u = new URL(href, window.location.href)
      isSameOrigin = u.origin === window.location.origin
    } catch (err) {
      isSameOrigin = false
    }

    if (isSameOrigin) {
      const a = document.createElement('a')
      a.href = href
      a.download = name
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    }

    // Cross-origin: try to fetch and download as blob (requires CORS)
    try {
      const res = await fetch(href, { mode: 'cors' })
      if (!res.ok) throw new Error('Network response was not ok')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      // As a last resort open in new tab so user can manually save
      window.open(href, '_blank', 'noopener')
    }
  }

  return (
    <button type="button" onClick={handleClick} className={`${baseClass} ${className}`.trim()}>
      {children || 'Télécharger'}
    </button>
  )
}
