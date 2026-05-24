import { PageHeader } from "../components/ui-common.jsx";

export default function About() {
  return (
    <div className="container-md fade-in" style={{ padding: "40px 24px 64px" }}>
      <PageHeader icon="info" title="About MindCare" subtitle="A quiet, private place for everyday wellness." />
      <div className="card" style={{ padding: 28 }}>
        <p style={{ lineHeight: 1.7 }}>
          MindCare is a small set of gentle tools — a chat companion, mood insights, habits, gratitude journaling,
          sleep tracking, and a wellness library. Nothing here replaces a therapist; it's here to walk alongside you.
        </p>
      </div>
    </div>
  );
}
