import { useEffect, useMemo, useState } from "react";
import GlassCard from "./components/GlassCard.jsx"
import ThemeToggle from "./components/ThemeToggle.jsx"
import TagFilter from "./components/TagFilter.jsx"
import projects from "./data/projects.json"
import NotionContent from "./components/NotionContent.jsx"
import GlassButton from "./components/GlassButton.jsx"
import site from "./data/site.json"
import "./index.css"

function useTags(allProjects) {
  const allTags = useMemo(() => {
    const set = new Set()
    allProjects.forEach(p => p.tags.forEach(t => set.add(t)))
    return Array.from(set).sort((a,b)=>a.localeCompare(b))
  }, [allProjects])
  return allTags
}

function Nav() {
  const sections = useMemo(() => ([
    { id: "home",       label: "Home" },
    { id: "about",      label: "About" },
    { id: "projects",   label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "contact",    label: "Contact" },
  ]), [])

  const [active, setActive] = useState("home")

  useEffect(() => {
  const HEADER = 84; // index.css의 scroll-margin-top과 동일하게 유지
  let tops = [];

  const measure = () => {
    tops = sections
      .map(({ id }) => {
        const el = document.getElementById(id);
        return { id, top: el ? el.getBoundingClientRect().top + window.scrollY : Infinity };
      })
      .sort((a, b) => a.top - b.top);
  };

  const pick = () => {
    const pos = window.scrollY + HEADER + 1;
    // ✅ 바닥 근처면 마지막 섹션으로 강제 전환
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (nearBottom) {
      setActive(sections[sections.length - 1].id);
      return;
    }
    // 현재 위치 기준, 가장 최근(위) 섹션 선택
    let current = sections[0].id;
    for (const r of tops) {
      if (r.top <= pos) current = r.id;
      else break;
    }
    setActive(current);
  };

  const onScroll = () => requestAnimationFrame(pick);
  const onResize = () => { measure(); pick(); };

  // 초기 해시(#about 등) 반영
  const hash = window.location.hash.slice(1);
  if (hash) setActive(hash);

  // 초기 측정 + 이벤트 등록
  measure(); pick();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  // ✅ 레이아웃/콘텐츠 높이 변화 대응 (프로젝트 필터 등)
  const main = document.querySelector("main");
  const ro = main ? new ResizeObserver(() => { measure(); pick(); }) : null;
  ro?.observe(main);

  // 폰트 로드 후 치수 변동 대응
  document.fonts?.ready?.then(() => { measure(); pick(); });

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    ro?.disconnect();
  };
}, [sections]);

  return (
    <header className="container topbar">
      <GlassCard>
        <nav className="nav">
          <a href="#home" className="brand brand-gradient brand-chip">Portfolio</a>
          <div className="links nav-links">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`nav-link ${active === id ? "active" : ""}`}
                aria-current={active === id ? "page" : undefined}
              >
                {label}
              </a>
            ))}
            <ThemeToggle />
          </div>
        </nav>
      </GlassCard>
    </header>
  )
}

function Hero() {
  return (
    <section id="home" className="container">
      <GlassCard>
        <div className="section pad-lg">
          <h1 className="title">{site?.heroName || "Park Young Ung"}</h1>
          <p className="subtitle">{site?.heroSubtitle || "Game Developer — DirectX 11, PBR, ECS, Tooling"}</p>
          <div className="row gap-sm">
            {site?.links?.github && (
              <a className="link" href={site.links.github} target="_blank" rel="noreferrer">GitHub</a>
            )}
            {site?.links?.linkedin && (
              <a className="link" href={site.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            )}
            {site?.links?.detail && (
              <a className="link" href={site.links.detail} target="_blank" rel="noreferrer">Detail</a>
            )}
            <a className="link" href="#contact">Email</a>
          </div>
        </div>
      </GlassCard>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="container">
      <GlassCard>
        <div className="section">
          <h2 className="h2">About</h2>
          <p className="text-body">
            {site?.aboutText || "Null" }
          </p>
        </div>
      </GlassCard>
    </section>
  )
}

function Projects() {
  const allTags = useTags(projects)
  const [selected, setSelected] = useState(new Set())
  const [openId, setOpenId] = useState(null)

  const filtered = useMemo(() => {
    if (selected.size === 0) return projects
    return projects.filter(p => p.tags?.some(t => selected.has(t)))
  }, [selected])

  const onToggle = (tag) => {
    const next = new Set(selected)
    next.has(tag) ? next.delete(tag) : next.add(tag)
    setSelected(next)
  }
  const onClear = () => setSelected(new Set())

  // ✅ 선택 카드로 스무스 스크롤
  const scrollToCard = (id) => {
    const el = document.getElementById(`project-${id}`)
    if (!el) return
    const HEADER = 84
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER - 8
    window.scrollTo({ top, behavior: "smooth" })
  }

  // ✅ Projects 섹션 상단으로 스크롤
  const scrollToProjects = () => {
    const sec = document.getElementById("projects")
    if (!sec) return
    const HEADER = 84
    const top = sec.getBoundingClientRect().top + window.scrollY - HEADER - 8
    window.scrollTo({ top, behavior: "smooth" })
  }

  const openDetails = (id) => {
    setOpenId(id)
    // DOM 업데이트 뒤 위치 보정
    setTimeout(() => scrollToCard(id), 0)
  }

  const closeDetails = () => {
    setOpenId(null)
    setTimeout(scrollToProjects, 0)
  }

  return (
    <section id="projects" className="container">
      <h2 className="h2 mb">Projects</h2>

      {/* 필터 카드 */}
      <GlassCard className="section">
        <div className="row between" style={{alignItems:"center"}}>
          <div>
            <div className="muted" style={{marginBottom:".5rem"}}>
              {selected.size === 0 ? "All projects" : `Filtered by: ${Array.from(selected).join(", ")}`}
            </div>
            <TagFilter
              allTags={allTags}
              selected={selected}
              onToggle={onToggle}
              onClear={onClear}
            />
          </div>
          <div className="muted" style={{whiteSpace:"nowrap"}}>
            {filtered.length} / {projects.length}
          </div>
        </div>
      </GlassCard>

      {/* 카드 그리드 */}
      <div className="grid" style={{ marginTop: "1rem" }}>
        {filtered.map((p) => {
          const expanded = openId === p.id
          return (
            <GlassCard
              key={p.id}
              id={`project-${p.id}`}
              className={expanded ? "expanded" : ""}
            >
              <div className={`card ${expanded ? "card-expanded" : ""}`}>
                {/* ✅ 뒤로가기 (확장 상태에서만 노출) */}
                {expanded && (
                  <div className="back-row">
                    <GlassButton size="sm" variant="ring" onClick={closeDetails} aria-label="Back to projects">
                      ← Back
                    </GlassButton>
                  </div>
                )}

                <h3 className="h3">{p.title}</h3>
                <p className="text-body project-desc">{p.desc}</p>

                <div className="tags">
                  {p.tags?.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>

                {/* 1행: Repo 링크 */}
                <div className="mt row gap-sm">
                  {p.link && (
                    <a className="link link-sm" href={p.link} target="_blank" rel="noreferrer">
                      Repo →
                    </a>
                  )}
                </div>

                {/* 2행: 확장 아닐 때만 Read more 노출 (확장 시엔 Back 버튼만) */}
                {!expanded && (
                  <div className="mt-xs">
                    <button
                      className="link link-sm"
                      onClick={() => openDetails(p.id)}
                      aria-expanded="false"
                      aria-controls={`project-${p.id}`}
                    >
                      Read more
                    </button>
                  </div>
                )}

                {/* ✅ 확장 시 Notion 내용 표시 */}
                {expanded && (
                  <div className="mt notion-wrap">
                    <NotionContent pageId={p.notionPageId} />
                  </div>
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}

function Experience() {
  const items = [
    { role: "Contents Developer", org: "게임 인재원", team: "MusketFire", period: "2024–2024", bullets: ["Musket 장전 로직 작성", "아이템 로직 작성"] },
    { role: "Engine Developer", org: "게임 인재원", team: "Song of Savior", period: "2024–2024", bullets: ["D2D 렌더 엔진 작성"] },
    { role: "Graphics Engineer", org: "게임 인재원", team: "BongsuRabbit", period: "2024–2025", bullets: ["DX11 렌더러 작성", "프로젝트용 자체 엔진 작성", "Imgui 툴링"] },
    { role: "Engine Developer", org: "게임 인재원", team: "Quan", period: "2024–2025", bullets: ["DX11 멀티스레드 렌더", "리플렉션/YAML 직렬화", "PBR + IBL + Bloom", "엔진 및 에디터"] },
  ]
return (
    <section id="experience" className="container /* section-tall 등 기존 클래스 유지 */">
      <h2 className="h2 mb">Experience</h2>
      <div className="col gap">
        {items.map((it) => (
          <GlassCard key={`${it.role}-${it.org}-${it.team || ""}`}>
            <div className="card">
              <div className="row between">
                <h3 className="h3">
                  {it.role} @ {it.org}
                </h3>
                <span className="muted">{it.period}</span>
              </div>

              {/* ✅ 팀명이 있으면 태그 형태로 노출 (기존 .tag 스타일 재사용) */}
              {it.team && (
                <div className="mt">
                  <span className="tag">Team: {it.team}</span>
                </div>
              )}

              <ul className="list mt">
                {it.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  const [copied, setCopied] = useState(false)
  const email = "ideneb@naver.com"
  return (
    <section id="contact" className="container">
      <GlassCard>
        <div className="card">
          <h2 className="h2">Contact</h2>
          <p className="text-body">프로젝트 협업/문의는 이메일로 부탁드립니다.</p>
          <div className="row gap-sm">
            <code className="code">{email}</code>
            <button
              className="link"
              onClick={() => {
                navigator.clipboard.writeText(email)
                setCopied(true)
                setTimeout(() => setCopied(false), 1200)
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </GlassCard>
    </section>
  )
}

export default function App() {
  return (
    <div className="bg text">
      <Nav />
      <main className="stack">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <footer className="container footer">
        © {new Date().getFullYear()} Park Young Ung · Built with a custom GlassCard
      </footer>
    </div>
  )
}
