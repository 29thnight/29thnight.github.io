import { useState } from "react";
import { GlassCard } from "liquid-glass-ui"; // 사이트 예시와 동일 API
import "./index.css";

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
];

function Nav() {
  return (
    <header className="px-4 md:px-8 py-5 sticky top-0 z-50">
      {/* 상단 네비도 유리 위에 떠있는 느낌: 카드로 감싸서 글래스 효과 */}
      <GlassCard variant="light" interactive specular>
        <nav className="flex items-center justify-between gap-4">
          <a href="#" className="font-semibold tracking-tight">/portfolio</a>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>
      </GlassCard>
    </header>
  );
}

function Hero() {
  return (
    <section className="px-4 md:px-8">
      <GlassCard variant="ultra" interactive specular>
        <div className="py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Park Young Ung
          </h1>
          <p className="mt-3 md:mt-4 text-sm md:text-base opacity-90">
            Graphics / Engine Developer — DirectX 11, PBR, Tooling
          </p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <a className="underline" href="https://github.com/USER" target="_blank" rel="noreferrer">GitHub</a>
            <a className="underline" href="https://linkedin.com/in/USER" target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="underline" href="#contact">Email</a>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="px-4 md:px-8 mt-10">
      <GlassCard variant="standard" interactive>
        <div className="py-8">
          <h2 className="section-title">About</h2>
          <p className="mt-3 opacity-90 leading-relaxed">
            디퍼드 렌더링, 멀티스레드 파이프라인, 포스트 프로세싱, 반사/굴절 등
            그래픽스 전반을 즐깁니다. ImGui 기반 툴링과 YAML 리플렉션 시스템으로
            워크플로우를 단순화합니다.
          </p>
        </div>
      </GlassCard>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="px-4 md:px-8 mt-10">
      <h2 className="section-title mb-4">Projects</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <GlassCard key={p.title} variant="intense" interactive specular>
            <div className="p-6">
              <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm opacity-90">{p.desc}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs opacity-80">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-1 rounded-full border border-white/20">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <a className="underline text-sm" href={p.link} target="_blank" rel="noreferrer">
                  View repository →
                </a>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function Experience() {
  const items = [
    { role: "Graphics Engineer", org: "Indie Studio", period: "2024–2025", bullets: ["DX11 멀티스레드 렌더", "PBR + IBL + Bloom", "툴링/프로파일러"] },
    { role: "Engine Developer", org: "University Lab", period: "2023–2024", bullets: ["ECS 전환", "리플렉션/YAML 직렬화", "Asset Pipeline"] },
  ];
  return (
    <section id="experience" className="px-4 md:px-8 mt-10">
      <h2 className="section-title mb-4">Experience</h2>
      <div className="grid gap-4">
        {items.map((it) => (
          <GlassCard key={it.role} variant="standard" interactive>
            <div className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-semibold tracking-tight">{it.role} @ {it.org}</h3>
                <span className="text-sm opacity-80">{it.period}</span>
              </div>
              <ul className="mt-3 list-disc list-inside opacity-90 text-sm">
                {it.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const email = "you@example.com";
  return (
    <section id="contact" className="px-4 md:px-8 mt-10 mb-20">
      <GlassCard variant="light" interactive specular>
        <div className="p-6">
          <h2 className="section-title">Contact</h2>
          <p className="mt-3 opacity-90 text-sm">프로젝트 협업/문의는 이메일로 부탁드립니다.</p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <code className="px-2 py-1 rounded bg-white/10">{email}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(email); setCopied(true); setTimeout(()=>setCopied(false), 1200); }}
              className="underline"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

export default function App() {
  return (
    <div className="body-bg text-white selection:bg-white/20">
      <Nav />
      <main className="space-y-10">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <footer className="px-4 md:px-8 pb-10 opacity-70 text-xs">
        <div className="mt-6">© {new Date().getFullYear()} Park Young Ung · Built with Liquid Glass UI</div>
      </footer>
    </div>
  );
}
