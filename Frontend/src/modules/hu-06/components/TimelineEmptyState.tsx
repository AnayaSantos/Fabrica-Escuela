import { Activity, CalendarClock, MapPin, Route, ShieldCheck } from 'lucide-react';

function SkeletonBar({ className = '' }: { className?: string }) {
  return <span className={`timeline-empty-skeleton ${className}`} aria-hidden="true" />;
}

export function TimelineEmptyState() {
  return (
    <section
      className="timeline-empty-state"
      aria-labelledby="timeline-empty-title"
      aria-describedby="timeline-empty-description"
    >
      <header className="timeline-empty-header">
        <span className="timeline-empty-icon" aria-hidden="true">
          <Route size={22} />
        </span>
        <div>
          <h2 id="timeline-empty-title">Vista previa de trazabilidad</h2>
          <p id="timeline-empty-description">
            Aquí verás el estado, la ruta y cada punto de control de tu envío.
          </p>
        </div>
      </header>

      <div className="timeline-empty-metrics" aria-hidden="true">
        <article className="timeline-empty-metric">
          <span className="timeline-empty-metric-icon timeline-empty-metric-icon--blue">
            <Activity size={18} />
          </span>
          <div>
            <span className="timeline-empty-label">Estado actual</span>
            <SkeletonBar className="timeline-empty-skeleton--metric" />
          </div>
        </article>
        <article className="timeline-empty-metric">
          <span className="timeline-empty-metric-icon timeline-empty-metric-icon--amber">
            <CalendarClock size={18} />
          </span>
          <div>
            <span className="timeline-empty-label">Tiempo estimado</span>
            <SkeletonBar className="timeline-empty-skeleton--metric" />
          </div>
        </article>
        <article className="timeline-empty-metric">
          <span className="timeline-empty-metric-icon timeline-empty-metric-icon--green">
            <MapPin size={18} />
          </span>
          <div>
            <span className="timeline-empty-label">Destino</span>
            <SkeletonBar className="timeline-empty-skeleton--metric" />
          </div>
        </article>
      </div>

      <div className="timeline-empty-track" aria-hidden="true">
        <div className="timeline-empty-line" />
        <div className="timeline-empty-step timeline-empty-step--complete">
          <span className="timeline-empty-node"><ShieldCheck size={14} /></span>
          <div className="timeline-empty-step-content">
            <SkeletonBar className="timeline-empty-skeleton--title" />
            <SkeletonBar className="timeline-empty-skeleton--detail" />
          </div>
        </div>
        <div className="timeline-empty-step timeline-empty-step--active">
          <span className="timeline-empty-node" />
          <div className="timeline-empty-step-content">
            <SkeletonBar className="timeline-empty-skeleton--title" />
            <SkeletonBar className="timeline-empty-skeleton--detail" />
          </div>
        </div>
        <div className="timeline-empty-step timeline-empty-step--pending">
          <span className="timeline-empty-node" />
          <div className="timeline-empty-step-content">
            <SkeletonBar className="timeline-empty-skeleton--title" />
            <SkeletonBar className="timeline-empty-skeleton--detail" />
          </div>
        </div>
      </div>
    </section>
  );
}
