export default function Card({ title, children }) {
  return (
    <section className="card">
      <header className="card__header">
        <h3 className="card__title">{title}</h3>
      </header>
      <div className="card__body">{children}</div>
    </section>
  );
}
