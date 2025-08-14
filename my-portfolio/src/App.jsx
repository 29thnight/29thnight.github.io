import { useState } from "react"
import GlassCard from "./components/GlassCard.jsx"
import "./index.css"

const projects = [
  {
    title: "Real-Time Renderer",
    tags: ["DirectX 11", "PBR", "ECS"],
    desc: "멀티스레드 렌더 파이프라인과 PBR/포스트프로세싱 구현.",
    link: "https://github.com/USER/real-time-renderer",
  },
  {
    title: "VFX Graph Editor",
    tags: ["ImGui", "Node Editor"],
    desc: "유니티 스타일 VFX 그래프 에디터 및 런타임 모듈.",
    link: "https://github.com/USER/vfx-graph",
  },
  {
    title: "YAML Reflection System",
    tags: ["C++", "Serialization"],
    desc: "런타임 리플렉션 + YAML 직렬화/역직렬화 프레임워크.",
    link: "https://github.com/USER/cpp-reflection",
  },
]

function Nav() {
  return (
    <header className="container topbar">
      <GlassCard>
        <nav className="nav">
          <a href="#" className="brand">/portfolio</a>
          <div className="links">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>
      </GlassCard>
    </header>
  )
}

function Hero() {
  return (
    <section className="container">
      <GlassCard>
        <div className="section pad-lg">
          <h1 className="title">Park Young Ung</h1>
          <p className="subtitle">Graphics / Engine Developer — DirectX 11, PBR, ECS, Tooling</p>
          <div className="row gap-sm">
            <a className="link" href="https://github.com/USER" target="_blank" rel="noreferrer">GitHub</a>
            <a className="link" href="https://linkedin.com/in/USER" target="_blank" rel="noreferrer">LinkedIn</a>
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
            디퍼드 렌더링, 멀티스레드 파이프라인, 포스트 프로세싱, 반사/굴절 등
            그래픽스 전반을 즐깁니다. ImGui 기반 툴링과 YAML 리플렉션 시스템으로
            워크플로우를 단순화합니다.
          </p>
        </div>
      </GlassCard>
    </section>
  )
}

function Projects() {
  return (
    <section id="projects" className="container">
      <h2 className="h2 mb">Projects</h2>
      <div className="grid">
        {projects.map((p) => (
          <GlassCard key={p.title}>
            <div className="card">
              <h3 className="h3">{p.title}</h3>
              <p className="text-body">{p.desc}</p>
              <div className="tags">
                {p.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
              <div className="mt">
                <a className="link" href={p.link} target="_blank" rel="noreferrer">
                  View repository →
                </a>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

function Experience() {
  const items = [
    { role: "Graphics Engineer", org: "Indie Studio", period: "2024–2025", bullets: ["DX11 멀티스레드 렌더", "PBR + IBL + Bloom", "툴링/프로파일러"] },
    { role: "Engine Developer", org: "University Lab", period: "2023–2024", bullets: ["ECS 전환", "리플렉션/YAML 직렬화", "Asset Pipeline"] },
  ]
  return (
    <section id="experience" className="container">
      <h2 className="h2 mb">Experience</h2>
      <div className="col gap">
        {items.map((it) => (
          <GlassCard key={it.role}>
            <div className="card">
              <div className="row between">
                <h3 className="h3">{it.role} @ {it.org}</h3>
                <span className="muted">{it.period}</span>
              </div>
              <ul className="list">
                {it.bullets.map((b) => <li key={b}>{b}</li>)}
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
  const email = "you@example.com"
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
