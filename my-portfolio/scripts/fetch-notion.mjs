// ESM + Node 20/22 OK (package.json에 "type":"module")
import { Client } from '@notionhq/client'
import fs from 'node:fs/promises'
import path from 'node:path'

/* ====== [Projects DB 속성 매핑] 필요 시 이름만 바꾸세요 ====== */
const NAME_PROP = 'Name'
const DESC_PROP = 'Description'
const TAGS_PROP = 'Tags'
const REPO_PROP = 'Repo'
const PUBLISHED_PROP = 'Published' // 체크박스(있으면 true인 것만 채택)
const ORDER_PROP = 'Order'         // 숫자(작을수록 상단)

/* ====== [Site Config DB 속성 매핑] (옵션) ====== */
const SITE_NAME_PROP      = 'ProfilName'
const SITE_SUBTITLE_PROP  = 'Desc'
const SITE_GITHUB_PROP    = 'GitHub'
const SITE_LINKEDIN_PROP  = 'LinkedIn'
const SITE_EMAIL_PROP     = 'Email'
const SITE_ABOUT_TEXT_PROP = 'AboutText'

/* ====== 환경변수 ====== */
const {
  NOTION_TOKEN,
  // ✅ 여러 DB를 쉼표로: "dbid1,dbid2,dbid3"
  NOTION_PROJECT_DB_IDS,
  // 하위 호환(단일 DB만 쓸 때)
  NOTION_DATABASE_ID,
  // (옵션) 사이트 설정 DB
  NOTION_SITE_DB_ID
} = process.env

if (!NOTION_TOKEN) {
  console.error('[notion] Missing NOTION_TOKEN')
  process.exit(1)
}

const notion = new Client({ auth: NOTION_TOKEN })

/* ====== 경로 준비 ====== */
const OUT_DATA_DIR   = path.join(process.cwd(), 'src', 'data')
const OUT_PUBLIC_DIR = path.join(process.cwd(), 'public', 'notion')
await fs.mkdir(OUT_DATA_DIR, { recursive: true })
await fs.mkdir(OUT_PUBLIC_DIR, { recursive: true })

/* ====== 유틸 ====== */
const text = (arr) => arr?.[0]?.plain_text ?? ''
const num  = (prop) => prop?.number ?? null
const bool = (prop) => (typeof prop?.checkbox === 'boolean' ? prop.checkbox : null)

async function getBlocksRecursive(block_id, depth = 0) {
  if (depth > 6) return []
  const out = []
  let start_cursor
  do {
    const r = await notion.blocks.children.list({ block_id, start_cursor })
    out.push(...r.results)
    start_cursor = r.next_cursor
  } while (start_cursor)
  for (const b of out) {
    if (b.has_children) b.children = await getBlocksRecursive(b.id, depth + 1)
  }
  return out
}

async function processImages(blocks, OUT_PUBLIC_DIR) {
  const assetsDir = path.join(OUT_PUBLIC_DIR, 'assets')
  await fs.mkdir(assetsDir, { recursive: true })

  async function pickExt(url, res) {
    // 1) URL 확장자
    try {
      const u = new URL(url)
      const m = u.pathname.match(/\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i)
      if (m) return m[1].toLowerCase().replace('jpeg', 'jpg')
    } catch {}
    // 2) 헤더(가능하면)
    const ct = res?.headers?.get?.('content-type') || ''
    if (ct.includes('png'))  return 'png'
    if (ct.includes('jpeg')) return 'jpg'
    if (ct.includes('webp')) return 'webp'
    if (ct.includes('gif'))  return 'gif'
    if (ct.includes('svg'))  return 'svg'
    return 'jpg'
  }

  async function walk(list) {
    if (!Array.isArray(list)) return
    for (const b of list) {
      if (b?.type === 'image') {
        const data = b.image
        const src = data?.type === 'external' ? data.external?.url : data.file?.url
        if (src) {
          let res
          try {
            // Node 18+ 내장 fetch 사용
            res = await fetch(src)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const ext = await pickExt(src, res)
            const filename = `${b.id}.${ext}`
            const dest = path.join(assetsDir, filename)
            const buf = Buffer.from(await res.arrayBuffer())
            await fs.writeFile(dest, buf)
            // ✅ 런타임에서 BASE_URL을 붙여 사용할 상대 경로만 기록
            data._local = `assets/${filename}`
          } catch (e) {
            // 실패 시 로컬 저장은 생략하고 원본 URL 그대로 사용 (만료될 수 있음)
            console.warn(`[notion] image download failed: ${e}`)
          }
        }
      }
      if (Array.isArray(b?.children) && b.children.length) {
        await walk(b.children)
      }
    }
  }
  await walk(blocks)
}

/* ============================================================
   A) Projects — 여러 DB 합치기
   ============================================================ */
const projectDbIds = (NOTION_PROJECT_DB_IDS
  ? NOTION_PROJECT_DB_IDS.split(',').map(s => s.trim()).filter(Boolean)
  : (NOTION_DATABASE_ID ? [NOTION_DATABASE_ID] : [])
)

let projects = []

if (projectDbIds.length) {
  console.log(`[notion] Project DBs: ${projectDbIds.join(', ')}`)

  async function fetchOneDB(DB_ID) {
    // 메타 확인(권한/ID 체크)
    const meta = await notion.databases.retrieve({ database_id: DB_ID })
    console.log(`[notion] DB OK: ${meta.title?.[0]?.plain_text || DB_ID}`)

    // 페이지 조회(페이지네이션)
    const pages = []
    let cursor
    do {
      const res = await notion.databases.query({
        database_id: DB_ID,
        start_cursor: cursor
        // 필요 시 filter/sorts 추가 가능
      })
      pages.push(...res.results)
      cursor = res.has_more ? res.next_cursor : undefined
    } while (cursor)

    // 매핑
    const items = pages.map((p) => {
      const props = p.properties || {}
      const publishedVal = bool(props[PUBLISHED_PROP]) // null | true | false
      const include = (publishedVal === null) ? true : (publishedVal === true)

      return {
        id: p.id,
        title: text(props[NAME_PROP]?.title),
        desc: text(props[DESC_PROP]?.rich_text),
        tags: (props[TAGS_PROP]?.multi_select || []).map(t => t.name),
        link: props[REPO_PROP]?.url || null,
        notionPageId: p.id,
        // 정렬용 메타(파일에는 안 담음)
        _order: num(props[ORDER_PROP]),
        _lastEdited: p.last_edited_time,
        _include: include,
        _db: DB_ID
      }
    })

    return items
  }

  // 각 DB에서 수집
  const collected = []
  for (const id of projectDbIds) {
    try {
      const items = await fetchOneDB(id)
      collected.push(...items)
    } catch (e) {
      console.error(`[notion] Fetch failed for DB ${id}: ${e.status || ''} ${e.code || ''} ${e.message || e}`)
      process.exit(1)
    }
  }

  // Published 필터(해당 속성이 있는 항목만 필터링 적용)
  const filtered = collected.filter(it => it._include)

  // 중복 제거(같은 페이지가 여러 DB에 있을 가능성 방지)
  const map = new Map()
  for (const it of filtered) {
    map.set(it.id, it)
  }
  const deduped = Array.from(map.values())

  // 정렬: Order(있으면 우선) → lastEdited desc
  deduped.sort((a, b) => {
    const ao = (typeof a._order === 'number') ? a._order : Number.POSITIVE_INFINITY
    const bo = (typeof b._order === 'number') ? b._order : Number.POSITIVE_INFINITY
    if (ao !== bo) return ao - bo
    return new Date(b._lastEdited) - new Date(a._lastEdited)
  })

  // 파일에 쓸 필드만 추출
  projects = deduped.map(({ id, title, desc, tags, link, notionPageId }) => ({
    id, title, desc, tags, link, notionPageId
  }))

  // 각 프로젝트 페이지의 블록을 저장
  for (const proj of projects) {
    const blocks = await getBlocksRecursive(proj.id)
    await processImages(blocks, OUT_PUBLIC_DIR) 
    await fs.writeFile(
      path.join(OUT_PUBLIC_DIR, `${proj.id}.json`),
      JSON.stringify({ id: proj.id, blocks }, null, 2),
      'utf8'
    )
  }

  // 목록 JSON 저장
  await fs.writeFile(
    path.join(OUT_DATA_DIR, 'projects.json'),
    JSON.stringify(projects, null, 2),
    'utf8'
  )
  console.log(`[notion] Projects: ${projects.length} items → src/data/projects.json`)
} else {
  console.log('[notion] No project DB IDs provided. (Set NOTION_PROJECT_DB_IDS or NOTION_DATABASE_ID)')
}

/* ====== B) Site Config (텍스트만) ====== */
if (NOTION_SITE_DB_ID) {
  try {
    const meta = await notion.databases.retrieve({ database_id: NOTION_SITE_DB_ID })
    console.log(`[notion] Site DB OK: ${meta.title?.[0]?.plain_text || NOTION_SITE_DB_ID}`)
  } catch (e) {
    console.error('[notion] Site databases.retrieve failed.')
    console.error(' → Site DB ID / 권한(Add connections) 확인')
    console.error(` Raw: ${e.status} ${e.code} ${e.message}`)
    process.exit(1)
  }

  // 최신 1개 행만 사용
  const res = await notion.databases.query({
    database_id: NOTION_SITE_DB_ID,
    page_size: 1
  })
  const row = res.results?.[0]
  if (!row) {
    console.warn('[notion] Site DB has no rows. Skipping site.json.')
  } else {
    const p = row.properties || {}

    // 유틸
    const joinText = (arr) => (arr || []).map(x => x?.plain_text ?? '').join('')
    const pickSubtitle = () =>
      joinText(p['Desc']?.rich_text) ||                  // 일반 케이스
      (p['Desc']?.title?.[0]?.plain_text ?? '') ||       // 실수로 Title 타입 사용 시
      (p['Desc']?.formula?.string ?? '')                 // Formula → string 결과 사용 시

    const site = {
      heroName:     (p['ProfilName']?.title?.[0]?.plain_text) || '',
      heroSubtitle: pickSubtitle(),
      links: {
        github:   p['GitHub']?.url || '',
        linkedin: p['LinkedIn']?.url || ''
      },
      contactEmail: p['Email']?.email || '',
      aboutText:    joinText(p[SITE_ABOUT_TEXT_PROP]?.rich_text) || ''
    }

    await fs.writeFile(
      path.join(OUT_DATA_DIR, 'site.json'),
      JSON.stringify(site, null, 2),
      'utf8'
    )
    console.log('[notion] Wrote src/data/site.json')
  }
} else {
  console.log('[notion] NOTION_SITE_DB_ID not set. Skipping site.json.')
}

console.log('[notion] Done.')
