export default function TagFilter({ allTags, selected, onToggle, onClear }) {
  const isAll = selected.size === 0

  return (
    <div className="tags filter">
      <button
        className={`tag ${isAll ? "tag-active" : ""}`}
        aria-pressed={isAll}
        onClick={onClear}
      >
        All
      </button>

      {allTags.map((t) => {
        const active = selected.has(t)
        return (
          <button
            key={t}
            className={`tag ${active ? "tag-active" : ""}`}
            aria-pressed={active}
            onClick={() => onToggle(t)}
          >
            {t}
          </button>
        )
      })}

      {selected.size > 0 && (
        <button className="tag tag-clear" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  )
}
