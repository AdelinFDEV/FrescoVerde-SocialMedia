export default function Card({ children, className = '', delay = 0, ...rest }) {
  return (
    <section
      className={`animate-rise rounded-2xl border border-ink-100 bg-white shadow-[0_1px_2px_rgba(28,35,43,0.04),0_8px_24px_-16px_rgba(28,35,43,0.18)] ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </section>
  )
}
