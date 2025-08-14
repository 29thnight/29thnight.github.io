export default function TagFilter({ allTags, selected, onToggle, onClear }) {
  return (
    <div className="tags filter">
      <button
        className={`tag ${selected.size === 0 ? "tag-active" : ""}`}
        onClick={onClear}
      >
        All
      </button>
      {allTags.map((t) => (
        <button
          key={t}
          className={`tag ${selected.has(t) ? "tag-active" : ""}`}
          onClick={() => onToggle(t)}
        >
          {t}
        </button>
      ))}
      {selected.size > 0 && (
        <button className="tag tag-clear" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  )
}
