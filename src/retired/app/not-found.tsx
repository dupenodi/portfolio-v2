import Link from "next/link";

export const metadata = {
  title: "not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="page-enter">
      <p className="d-eyebrow">404</p>
      <h1 className="d-title">page not found</h1>
      <p className="d-body">this url doesn&apos;t exist.</p>
      <Link href="/" className="back" style={{ marginTop: "2rem" }}>
        <span className="a">←</span> index
      </Link>
    </div>
  );
}
