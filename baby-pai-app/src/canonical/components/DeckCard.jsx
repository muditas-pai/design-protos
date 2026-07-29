export default function DeckCard({ deck }) {
  return (
    <button className="card">
      <img className="cover" src={deck.thumb} alt="" loading="lazy" />
      <span className="card-body">
        <span className="card-title">{deck.title}</span>
        <span className="card-sub">{deck.sub}</span>
      </span>
    </button>
  )
}
