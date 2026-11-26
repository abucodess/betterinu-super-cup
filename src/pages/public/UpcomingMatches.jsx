import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Pause, Play } from 'lucide-react';
import { ClubCrest } from '../../components/shared/ArenaUI';
import { formatKickoff, MatchStatus } from '../../components/shared/MatchSummary';
import { officialCrests } from '../../features/teams/officialCrests';

const rotationInterval = 6500;
const reducedMotion = '(prefers-reduced-motion: reduce)';

function FixtureTeam({ team, fallback }) {
  const logo = officialCrests[team?.short_code] || team?.logo_url;
  return (
    <span className="league-fixture-team">
      <ClubCrest club={{ ...team, logo_url: logo }} eager />
      <strong>{team?.name || fallback}</strong>
    </span>
  );
}

function FixtureCard({ match }) {
  return (
    <Link className="league-fixture" to={`/public/live?match=${encodeURIComponent(match.id)}`}>
      <span className="league-fixture-teams">
        <FixtureTeam team={match.home_team} fallback="Home team" />
        <span className="league-fixture-vs">VS</span>
        <FixtureTeam team={match.away_team} fallback="Away team" />
      </span>
      <span className="league-fixture-meta">
        <time dateTime={match.kickoff_time}>
          <CalendarDays size={14} aria-hidden="true" />
          {formatKickoff(match.kickoff_time)}
        </time>
        <MatchStatus match={match} />
      </span>
    </Link>
  );
}

function slidePosition(track, index) {
  const offset = track.children[index].offsetLeft - track.children[0].offsetLeft;
  return Math.min(offset, track.scrollWidth - track.clientWidth);
}

function closestSlide(track) {
  return Array.from(track.children).reduce((closest, _, index) => (
    Math.abs(slidePosition(track, index) - track.scrollLeft) <
    Math.abs(slidePosition(track, closest) - track.scrollLeft) ? index : closest
  ), 0);
}

function goToSlide(track, index) {
  track.scrollTo({
    left: slidePosition(track, index),
    behavior: window.matchMedia(reducedMotion).matches ? 'instant' : 'smooth',
  });
}

export function UpcomingMatches({ matches }) {
  const trackRef = useRef(null);
  const carouselRef = useRef(null);
  const lastInteraction = useRef(0);
  const pointerDown = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => window.matchMedia(reducedMotion).matches);

  useEffect(() => {
    const media = window.matchMedia(reducedMotion);
    const onChange = (event) => setPrefersReducedMotion(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    function syncLayout() {
      setIsScrollable(track.scrollWidth > track.clientWidth + 1);
      setActiveIndex(closestSlide(track));
    }
    const observer = new ResizeObserver(syncLayout);
    observer.observe(track);
    syncLayout();
    return () => observer.disconnect();
  }, [matches.length]);

  useEffect(() => {
    if (!isScrollable || isPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      const carousel = carouselRef.current;
      const hasHover = window.matchMedia('(hover: hover)').matches && carousel.matches(':hover');
      if (document.hidden || pointerDown.current || hasHover || carousel.matches(':focus-within') ||
          Date.now() - lastInteraction.current < 5000) return;

      const track = trackRef.current;
      goToSlide(track, (closestSlide(track) + 1) % track.children.length);
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [isScrollable, isPaused, prefersReducedMotion]);

  function recordInteraction() {
    lastInteraction.current = Date.now();
  }

  function endPointerInteraction() {
    if (!pointerDown.current) return;
    pointerDown.current = false;
    recordInteraction();
  }

  return (
    <div
      className="league-fixture-carousel"
      ref={carouselRef}
      onPointerDown={() => { pointerDown.current = true; }}
      onPointerUp={endPointerInteraction}
      onPointerCancel={endPointerInteraction}
      onPointerLeave={endPointerInteraction}
      onWheel={recordInteraction}
    >
      <ul
        className="league-fixture-track"
        ref={trackRef}
        role="list"
        onScroll={(event) => {
          recordInteraction();
          setActiveIndex(closestSlide(event.currentTarget));
        }}
      >
        {matches.map((match) => (
          <li key={match.id}><FixtureCard match={match} /></li>
        ))}
      </ul>
      {isScrollable && (
        <div className="league-fixture-controls">
          <div role="group" aria-label="Select an upcoming fixture" className="league-fixture-pagination">
            {matches.map((match, index) => (
              <button
                key={match.id}
                type="button"
                aria-label={`Show fixture ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                onClick={() => goToSlide(trackRef.current, index)}
              ><span /></button>
            ))}
          </div>
          {!prefersReducedMotion && (
            <button
              type="button"
              onClick={() => setIsPaused((paused) => !paused)}
              aria-label={isPaused ? 'Resume automatic scrolling' : 'Pause automatic scrolling'}
            >{isPaused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button>
          )}
        </div>
      )}
    </div>
  );
}
