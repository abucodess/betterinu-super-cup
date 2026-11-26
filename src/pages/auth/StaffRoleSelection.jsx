import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flag, ShieldCheck } from 'lucide-react';

export const staffPortals = [
  {
    id: 'referee',
    label: 'Referee',
    title: 'Referee Portal',
    description: 'Manage assigned matches, update scores, and record goals, assists, and cards.',
    image: '/assets/staff-referee.svg',
    icon: Flag,
  },
  {
    id: 'admin',
    label: 'Admin',
    title: 'Administrator Portal',
    description: 'Manage teams, player photos, fixtures, and official league information.',
    image: '/assets/staff-administrator.svg',
    icon: ShieldCheck,
  },
];

const twoColumnQuery = '(min-width: 760px)';

function slideOffset(track, index) {
  return track.children[index].offsetLeft - track.children[0].offsetLeft;
}

export function StaffRoleSelection({ active, onChange }) {
  const [isWide, setIsWide] = useState(() => window.matchMedia(twoColumnQuery).matches);
  const rail = useRef(null);
  const scrollTimer = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const media = window.matchMedia(twoColumnQuery);
    const onResize = () => setIsWide(media.matches);
    media.addEventListener('change', onResize);
    return () => {
      media.removeEventListener('change', onResize);
      window.clearTimeout(scrollTimer.current);
    };
  }, []);

  useLayoutEffect(() => {
    window.clearTimeout(scrollTimer.current);
    rail.current.scrollLeft = isWide ? 0 : slideOffset(rail.current, activeRef.current);
  }, [isWide]);

  function selectSlide(index) {
    onChange(index);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.current.scrollTo({ left: slideOffset(rail.current, index), behavior: motion ? 'auto' : 'smooth' });
  }

  function syncSelection(event) {
    if (isWide) return;
    const track = event.currentTarget;
    window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => {
      onChange(track.scrollLeft < slideOffset(track, 1) / 2 ? 0 : 1);
    }, 95);
  }

  return (
    <>
      <div className="staff-role-selector" role="group" aria-label="Staff portals" data-role={staffPortals[active].id}>
        {staffPortals.map(({ id, label, icon: Icon }, index) => (
          <button key={id} type="button" aria-pressed={active === index} onClick={() => selectSlide(index)}>
            <Icon size={16} aria-hidden="true" />{label}
          </button>
        ))}
      </div>
      <div className="staff-role-track" ref={rail} onScroll={syncSelection}>
        {staffPortals.map(({ id, label, title, description, image, icon: Icon }, index) => {
          const offscreen = !isWide && active !== index;
          return (
            <article className="staff-role-card" key={id} data-role={id} aria-hidden={offscreen || undefined}>
              <img className="staff-role-illustration" src={image} width="400" height="236" alt="" draggable={false} />
              <div className="staff-role-card-content">
                <h2><span><Icon size={18} aria-hidden="true" /></span>{title}</h2>
                <p>{description}</p>
                <Link className="staff-login-primary" to={`/login?portal=${id}`} tabIndex={offscreen ? -1 : undefined}
                  onClick={() => onChange(index)}
                >
                  Continue as {label} <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      <div className="staff-role-dots" role="group" aria-label="Select a staff slide">
        {staffPortals.map(({ id, label }, index) => (
          <button
            key={id} type="button" aria-label={`Show ${label} portal`} aria-current={active === index ? 'true' : undefined}
            onClick={() => selectSlide(index)}
          ><span /></button>
        ))}
      </div>
    </>
  );
}
