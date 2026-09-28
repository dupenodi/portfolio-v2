// Up and down arrows for a row's position, each its own tiny form so they work without any client code.
export function OrderButtons({ up, down, first, last }: { up: () => Promise<void>; down: () => Promise<void>; first: boolean; last: boolean }) {
  return (
    <div className="admin-order">
      <form action={up}>
        <button className="admin-link" disabled={first} aria-label="move up">
          ↑
        </button>
      </form>
      <form action={down}>
        <button className="admin-link" disabled={last} aria-label="move down">
          ↓
        </button>
      </form>
    </div>
  );
}
