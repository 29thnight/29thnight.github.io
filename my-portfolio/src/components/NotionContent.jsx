import { useEffect, useState } from 'react'

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/'

function Rich({ nodes }) {
  return nodes?.map((r, i) => <span key={i}>{r.plain_text}</span>)
}

function Block({ b }) {
  const t = b.type
  const data = b[t]
  switch (t) {
    case 'image': { 
      const cap = (data.caption || []).map(c => c.plain_text).join('')
      const local = data._local ? `${BASE}notion/${data._local}` : null
      const remote = data.type === 'external' ? data.external?.url : data.file?.url
      const src = local || remote
      if (!src) return null
      return (
        <figure className="notion-img">
          <img src={src} alt={cap || 'image'} loading="lazy" />
          {cap ? <figcaption>{cap}</figcaption> : null}
        </figure>
      )
    }
    case 'heading_1': return <h1 className="h2"><Rich nodes={data.rich_text} /></h1>
    case 'heading_2': return <h2 className="h3"><Rich nodes={data.rich_text} /></h2>
    case 'heading_3': return <h3 className="h3"><Rich nodes={data.rich_text} /></h3>
    case 'paragraph': return <p className="text-body"><Rich nodes={data.rich_text} /></p>
    case 'quote':     return <blockquote className="text-body" style={{opacity:.85}}><Rich nodes={data.rich_text} /></blockquote>
    case 'divider':   return <hr />
    case 'code':      return <pre><code>{data.rich_text?.map(r=>r.plain_text).join('')}</code></pre>
    case 'bulleted_list_item':
      return (
        <li>
          <Rich nodes={data.rich_text} />
          {b.children?.length ? <ul>{b.children.map(c => <Block key={c.id} b={c} />)}</ul> : null}
        </li>
      )
    case 'numbered_list_item':
      return (
        <li>
          <Rich nodes={data.rich_text} />
          {b.children?.length ? <ol>{b.children.map(c => <Block key={c.id} b={c} />)}</ol> : null}
        </li>
      )
    default:
      return null
  }
}

export default function NotionContent({ pageId }) {
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const url = `${BASE}notion/${pageId}.json`
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${r.statusText}`)))
      .then(setDoc)
      .catch(e => setError(String(e)))
  }, [pageId])

  if (error) return <p className="text-body">Failed to load Notion content: {error}</p>
  if (!doc) return <p className="text-body">Loading…</p>

  return (
    <div className="notion">
      {doc.blocks.map((b) => b && <Block key={b.id} b={b} />)}
    </div>
  )
}
