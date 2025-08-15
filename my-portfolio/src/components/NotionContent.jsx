import { useEffect, useState } from 'react'

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/'

/* === Rich text (굵게/기울임/밑줄/취소/인라인코드/링크) === */
function RichText({ nodes }) {
  if (!nodes) return null
  return nodes.map((r, i) => {
    const a = r.annotations || {}
    const cls = [
      a.bold ? 'nt-bold' : '',
      a.italic ? 'nt-italic' : '',
      a.underline ? 'nt-underline' : '',
      a.strikethrough ? 'nt-strike' : '',
      a.code ? 'nt-code' : '',
    ].filter(Boolean).join(' ')
    const content = <span className={cls}>{r.plain_text}</span>
    return r.href
      ? <a key={i} className="link" href={r.href} target="_blank" rel="noreferrer">{content}</a>
      : <span key={i}>{content}</span>
  })
}

/* === 블록 렌더 === */
function Block({ b }) {
  if (!b) return null
  const t = b.type
  const data = b[t]

  switch (t) {
    case 'heading_1': return <h1 className="h2"><RichText nodes={data.rich_text} /></h1>
    case 'heading_2': return <h2 className="h3"><RichText nodes={data.rich_text} /></h2>
    case 'heading_3': return <h3 className="h3"><RichText nodes={data.rich_text} /></h3>

    case 'paragraph':
      return <p className="text-body"><RichText nodes={data.rich_text} /></p>

    /* ✅ 인용 */
    case 'quote':
      return (
        <blockquote className="notion-quote">
          <RichText nodes={data.rich_text} />
          {b.children?.length ? b.children.map(c => <Block key={c.id} b={c} />) : null}
        </blockquote>
      )

    /* ✅ 콜아웃 */
    case 'callout': {
      const emoji = data.icon?.emoji || '💡'
      return (
        <div className="notion-callout">
          <div className="callout-icon">{emoji}</div>
          <div className="callout-content">
            <RichText nodes={data.rich_text} />
            {b.children?.length ? b.children.map(c => <Block key={c.id} b={c} />) : null}
          </div>
        </div>
      )
    }

    /* ✅ 코드 블록 */
    case 'code': {
      const txt = (data.rich_text || []).map(x => x.plain_text).join('')
      const lang = data.language || ''
      return (
        <pre className="notion-code">
          <code>{txt}</code>
          {lang ? <span className="code-lang">{lang}</span> : null}
        </pre>
      )
    }

    /* 리스트(단일 아이템) — 간단 렌더 */
    case 'bulleted_list_item':
      return (
        <li>
          <RichText nodes={data.rich_text} />
          {b.children?.length ? <ul>{b.children.map(c => <Block key={c.id} b={c} />)}</ul> : null}
        </li>
      )
    case 'numbered_list_item':
      return (
        <li>
          <RichText nodes={data.rich_text} />
          {b.children?.length ? <ol>{b.children.map(c => <Block key={c.id} b={c} />)}</ol> : null}
        </li>
      )

    /* 체크박스 */
    case 'to_do':
      return (
        <label className="notion-todo">
          <input type="checkbox" checked={!!data.checked} readOnly />{' '}
          <RichText nodes={data.rich_text} />
        </label>
      )

    /* 토글(펼치기) */
    case 'toggle':
      return (
        <details className="notion-toggle">
          <summary><RichText nodes={data.rich_text} /></summary>
          {b.children?.length ? b.children.map(c => <Block key={c.id} b={c} />) : null}
        </details>
      )

    /* 구분선 */
    case 'divider': return <hr />

    /* ✅ 이미지 (빌드 시 로컬 저장 버전도 지원) */
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
