import { PageHeader } from "../components/ui-common.jsx";
import { Icon } from "../lib/icon.jsx";

export default function Contact() {
  return (
    <div className="container-md fade-in" style={{ padding: "40px 24px 64px" }}>
      <PageHeader icon="mail" title="Contact" subtitle="Have a question or a kind word? We'd love to hear from you." />
      <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <p>
          <Icon name="mail" size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          hello@mindcare.example
        </p>
        <p>
          <Icon name="github" size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          <a href="https://github.com/SaumyaBish-t/MindCare" target="_blank" rel="noreferrer" style={{ color: "var(--dawn-peach)" }}>
            github.com/SaumyaBish-t/MindCare
          </a>
        </p>
      </div>
    </div>
  );
}
