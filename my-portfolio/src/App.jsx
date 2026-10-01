// src/App.jsx — Simplematic X 스타일 포트폴리오
import { useEffect, useState } from "react";
import site from "./data/site.json";
import projects from "./data/projects.json";
import NotionContent from "./components/NotionContent";
import "./simplematic.css";

const clean = (t) => String(t).replace(/^"+|"+$/g, "");
const NOTION_HOME = "https://evanescent-stage-4f5.notion.site/2bada11263ef8099bc8ec0c57856ac38";
const notionUrl = (id) => `https://evanescent-stage-4f5.notion.site/${id.replace(/-/g, "")}`;
const realLink = (l) => (l && !l.includes("/USER/") ? l : null);
const items = projects.map((p) => ({ ...p, tags: p.tags.map(clean) }));

const NAV = [
  { id: "home", label: "Home", d: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { id: "about", label: "About", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0z" },
  { id: "portfolio", label: "Portfolio", d: "M4 20l1-5L16 4l4 4L9 19zM14 6l4 4" },
  { id: "skills", label: "Skills", d: "M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6" },
  { id: "contact", label: "Contact", d: "M4 5h16v11H9l-5 4z" },
];

const Arrow = () => (
  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M2 8L8 2M3 2h5v5" />
  </svg>
);

function Mock({ title, tag }) {
  return (
    <div className="mock">
      <div className="mock-win">
        <div className="mock-bar"><i /><i /><i /></div>
        <b>{title}</b>
        <span>{tag}</span>
        <div className="mock-lines"><u /><u /><u /></div>
      </div>
    </div>
  );
}

function useRoute() {
  const get = () => window.location.hash.replace(/^#\/?/, "");
  const [r, setR] = useState(get);
  useEffect(() => {
    const h = () => { setR(get()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return r;
}

function Dock({ detail }) {
  const go = (id) => {
    if (detail) { window.location.hash = "#/"; setTimeout(() => scrollTo(id), 50); }
    else scrollTo(id);
  };
  const scrollTo = (id) =>
    id === "home"
      ? window.scrollTo({ top: 0, behavior: "smooth" })
      : document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <nav className="dock" aria-label="Sections">
      {NAV.map((n) => (
        <button key={n.id} title={n.label} aria-label={n.label} onClick={() => go(n.id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
            <path d={n.d} />
          </svg>
        </button>
      ))}
    </nav>
  );
}

function Home() {
  const [feat, ...rest] = items;
  const skills = [...new Set(items.flatMap((p) => p.tags))];
  const { github, linkedin, detail } = site.links;
  const socials = [["Notion", NOTION_HOME], ["GitHub", github], ["LinkedIn", linkedin], ["Detail", detail]].filter(([, u]) => u);
  return (
    <>
      <header className="hero" id="home">
        <div className="avatar">{site.heroName.split(" ").map((s) => s[0]).join("")}</div>
        <div>
          <h1>Hello, I am {site.heroName.split(" ")[0]}.<br />{site.heroSubtitle.split("—")[0].trim()}.</h1>
          <p>{site.heroSubtitle.split("—")[1]?.trim()}</p>
          <a className="link" href={`mailto:${site.contactEmail}`}>Contact me <Arrow /></a>
          <a className="link" style={{ marginLeft: 16 }} href={NOTION_HOME} target="_blank" rel="noreferrer">Notion <Arrow /></a>
        </div>
      </header>

      <section id="about" className="split">
        <div>
          <h2>About me</h2>
          <p>{site.aboutText}</p>
          <a className="link" href="#portfolio" onClick={(e) => { e.preventDefault(); document.getElementById("portfolio").scrollIntoView({ behavior: "smooth" }); }}>See projects <Arrow /></a>
        </div>
        <aside>
          <h3>Focus</h3>
          {["DirectX 11 Rendering", "Engine Architecture", "Tooling (ImGui)", "Multithreading"].map((f) => (
            <div className="exp" key={f}><b>{f}</b></div>
          ))}
        </aside>
      </section>

      <section id="portfolio">
        <div className="sec-head">
          <div><h2>Portfolio</h2><p>Selected engine and game projects.</p></div>
          <span className="link">{items.length} projects</span>
        </div>
        <div className="grid">
          <a className="card feat" href={`#/project/${feat.id}`}>
            <div className="card-body">
              <div className="ico">▮▮</div>
              <small>{feat.tags[0]}</small>
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
              <span className="link">See project <Arrow /></span>
            </div>
            <Mock title={feat.title.split(" - ").pop()} tag={feat.tags.join(" · ")} />
          </a>
          {rest.map((p) => (
            <a className="card" key={p.id} href={`#/project/${p.id}`}>
              <div className="card-body">
                <div className="ico">◆</div>
                <small>{p.tags.join(" · ")}</small>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
              <Mock title={p.title.split(" - ").pop()} tag={p.tags[0]} />
            </a>
          ))}
        </div>
      </section>

      <section id="skills">
        <div className="sec-head"><div><h2>Skills</h2><p>Technologies used across projects.</p></div></div>
        <div className="tiles">
          {skills.map((s) => (
            <div className="tile" key={s}><div className="ico">◇</div><h4>{s}</h4></div>
          ))}
        </div>
      </section>

      <section id="contact">
        <div className="sec-head"><div><h2>Contact</h2><p>{site.contactEmail}</p></div></div>
        <div className="tiles socials">
          <a className="tile" href={`mailto:${site.contactEmail}`}>Email</a>
          {socials.map(([n, u]) => <a className="tile" key={n} href={u} target="_blank" rel="noreferrer">{n}</a>)}
        </div>
      </section>
    </>
  );
}

function Project({ id }) {
  const p = items.find((x) => x.id === id);
  if (!p) return <p>Project not found. <a className="link" href="#/">Back</a></p>;
  const ext = realLink(p.link);
  return (
    <article>
      <a className="link back" href="#/">← All projects</a>
      <h2 className="ph">{p.title}</h2>
      <p>{p.desc}</p>
      <div className="meta">
        <div><b>Tags</b><span>{p.tags.join(", ")}</span></div>
        <div><b>Role</b><span>Development</span></div>
        <div><b>Notion</b><a className="link" href={notionUrl(p.notionPageId)} target="_blank" rel="noreferrer">View page <Arrow /></a></div>
        {ext && <div><b>Website</b><a className="link" href={ext} target="_blank" rel="noreferrer">Visit <Arrow /></a></div>}
      </div>
      <Mock title={p.title.split(" - ").pop()} tag={p.tags[0]} />
      <NotionContent pageId={p.notionPageId} />
    </article>
  );
}

export default function App() {
  const route = useRoute();
  const m = route.match(/^project\/(.+)$/);
  return (
    <div className="page">
      {m ? <Project id={m[1]} /> : <Home />}
      <footer>© {new Date().getFullYear()} {site.heroName}</footer>
      <Dock detail={!!m} />
    </div>
  );
}
