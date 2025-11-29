import { useEffect, useState, useRef } from 'react'
import Prism from 'prismjs'

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/'

/* === Code Block with Syntax Highlighting === */
function CodeBlock({ code, language, displayLang }) {
  const codeRef = useRef(null)

  useEffect(() => {
    if (codeRef.current && language !== 'plaintext') {
      try {
        Prism.highlightElement(codeRef.current)
      } catch (e) {
        console.warn('Prism highlighting failed:', e)
      }
    }
  }, [code, language])

  return (
    <pre className="notion-code">
      <code ref={codeRef} className={`language-${language}`}>
        {code}
      </code>
      {displayLang ? <span className="code-lang">{displayLang}</span> : null}
    </pre>
  )
}

/* === Rich text === */
function RichText({ nodes }) {
  if (!nodes) return null
  return nodes.map((r, i) => {
    const a = r.annotations || {}
    const cls = [
      a.bold && 'nt-bold',
      a.italic && 'nt-italic',
      a.underline && 'nt-underline',
      a.strikethrough && 'nt-strike',
      a.code && 'nt-code',
    ].filter(Boolean).join(' ')
    const content = <span className={cls}>{r.plain_text}</span>
    return r.href
      ? <a key={i} className="link" href={r.href} target="_blank" rel="noreferrer">{content}</a>
      : <span key={i}>{content}</span>
  })
}

/* === 연속 리스트 아이템을 <ul>/<ol>로 묶어서 렌더 === */
function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return null
  const out = []
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (!b) continue

    if (b.type === 'bulleted_list_item') {
      const items = []
      while (i < blocks.length && blocks[i]?.type === 'bulleted_list_item') {
        items.push(blocks[i]); i++
      }
      i-- // 앞질러간 인덱스 보정
      out.push(
        <ul className="nt-list" key={'ul-' + items[0].id}>
          {items.map(it => <Block key={it.id} b={it} />)}
        </ul>
      )
      continue
    }
    if (b.type === 'numbered_list_item') {
      const items = []
      while (i < blocks.length && blocks[i]?.type === 'numbered_list_item') {
        items.push(blocks[i]); i++
      }
      i--
      out.push(
        <ol className="nt-list" key={'ol-' + items[0].id}>
          {items.map(it => <Block key={it.id} b={it} />)}
        </ol>
      )
      continue
    }

    out.push(<Block key={b.id} b={b} />)
  }
  return out
}

/* === 블록 렌더 === */
function Block({ b }) {
  if (!b) return null
  const t = b.type
  const data = b[t]

  switch (t) {
    case 'heading_1': return <h2 className="nt-h1"><RichText nodes={data.rich_text} /></h2>
    case 'heading_2': return <h3 className="nt-h2"><RichText nodes={data.rich_text} /></h3>
    case 'heading_3': return <h4 className="nt-h3"><RichText nodes={data.rich_text} /></h4>

    case 'paragraph':
      return <p className="text-body"><RichText nodes={data.rich_text} /></p>

    /* 인용 */
    case 'quote':
      return (
        <blockquote className="notion-quote">
          <RichText nodes={data.rich_text} />
          {b.children?.length ? renderBlocks(b.children) : null}
        </blockquote>
      )

    /* 콜아웃 */
    case 'callout': {
      const emoji = data.icon?.emoji || '💡'
      return (
        <div className="notion-callout">
          <div className="callout-icon">{emoji}</div>
          <div className="callout-content">
            <RichText nodes={data.rich_text} />
            {b.children?.length ? renderBlocks(b.children) : null}
          </div>
        </div>
      )
    }

    /* 코드 */
    case 'code': {
      const txt = (data.rich_text || []).map(x => x.plain_text).join('')
      const lang = data.language || ''
      const langMap = {
        'c++': 'cpp',
        'c#': 'csharp',
        'plain text': 'plaintext'
      }
      const prismLang = langMap[lang.toLowerCase()] || lang.toLowerCase() || 'plaintext'
      
      return <CodeBlock code={txt} language={prismLang} displayLang={lang} />
    }

    /* 리스트 아이템 (자식 리스트는 li 내부에서 한 번만 감싸기) */
    case 'bulleted_list_item':
      return (
        <li>
          <RichText nodes={data.rich_text} />
          {b.children?.length ? (
            <ul className="nt-list">{b.children.map(c => <Block key={c.id} b={c} />)}</ul>
          ) : null}
        </li>
      )
    case 'numbered_list_item':
      return (
        <li>
          <RichText nodes={data.rich_text} />
          {b.children?.length ? (
            <ol className="nt-list">{b.children.map(c => <Block key={c.id} b={c} />)}</ol>
          ) : null}
        </li>
      )

    case 'to_do':
      return (
        <label className="notion-todo">
          <input type="checkbox" checked={!!data.checked} readOnly />{' '}
          <RichText nodes={data.rich_text} />
        </label>
      )

    case 'toggle':
      return (
        <details className="notion-toggle">
          <summary><RichText nodes={data.rich_text} /></summary>
          {b.children?.length ? renderBlocks(b.children) : null}
        </details>
      )

    case 'divider': return <hr />

    /* 이미지(로컬 저장 버전과 원격 둘 다 지원) */
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
    const v = (typeof __BUILD_ID__ !== 'undefined') ? `?v=${__BUILD_ID__}` : ''
    const url = `${BASE}notion/${pageId}.json${v}`
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${r.statusText}`)))
      .then(setDoc)
      .catch(e => setError(String(e)))
  }, [pageId])

  if (error) return <p className="text-body">Failed to load Notion content: {error}</p>
  if (!doc) return <p className="text-body">Loading…</p>

  return (
    <div className="notion">
      {renderBlocks(doc.blocks)}
    </div>
  )
}
