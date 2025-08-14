export default function GlassButton({
  children,
  className = "",
  onClick,
  size = "sm",          // sm | md
  variant = "ring",     // ring | solid
  type = "button",
  ...rest
}) {
  const cls = [
    "glass-btn",
    size === "sm" ? "glass-btn-sm" : "",
    variant === "ring" ? "glass-btn--ring" : "",
    className
  ].join(" ").trim()

  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
