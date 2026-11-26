import React, { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ClubCrest({ club, className = '', eager = false }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const name = club?.name || club?.team_name;
  const logo = club?.logo_url;
  return (
    <span className={`arena-crest ${className}`} aria-hidden="true">
      {logo && failedUrl !== logo ? (
        <img src={logo} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailedUrl(logo)} />
      ) : (
        <span>{club?.short_code || name?.slice(0, 3).toUpperCase() || <Shield size={20} />}</span>
      )}
    </span>
  );
}

export function ArenaHeading({ title, description, back = '/public', children }) {
  return (
    <header className="arena-page-heading">
      <div className="min-w-0">
        <Link to={back} className="arena-back"><ArrowLeft size={15} /> Arena home</Link>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </header>
  );
}

export function ArenaState({ children, error = false, onRetry }) {
  return (
    <div className="arena-state" role={error ? 'alert' : 'status'}>
      <p>{children}</p>
      {onRetry && <button className="arena-button" type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}

const formLabels = { W: 'Win', D: 'Draw', L: 'Loss' };

export function FormIndicator({ form = [] }) {
  if (!form.length) return <span className="arena-muted">—<span className="sr-only"> No completed matches</span></span>;

  return (
    <span className="arena-form">
      {form.map((result, index) => (
        <span key={index} data-result={result} title={formLabels[result]}>
          <span aria-hidden="true">{result}</span><span className="sr-only">{formLabels[result]}</span>
        </span>
      ))}
    </span>
  );
}

