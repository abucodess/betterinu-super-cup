import React from 'react';
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import './championship.css';

export const BETTY_MASCOT_URL = '/assets/aistudio/betty_robott__1__e878ecff.png';

const artwork = '/assets/championship/campaign';

export function HeroSection() {
  return (
    <section className="championship-hero" aria-labelledby="championship-title">
      <div className="championship-branding">
        <h1 id="championship-title">
          <img src="/assets/betterinu-league-logo.webp" alt="Betterinu Football League" width="900" height="524" />
        </h1>
        <p className="championship-year">2026</p>
      </div>

      <div className="championship-trophy">
        <img
          src="/assets/betterinu-championship-trophy.webp"
          alt="The official Betterinu championship trophy with a gold emblem and silver base"
          width="322"
          height="948"
        />
      </div>

      <picture className="championship-artwork">
        <source
          media="(min-width: 1024px), (min-width: 820px) and (max-height: 650px)"
          srcSet={`${artwork}-landscape-compact.webp 1280w, ${artwork}-landscape.webp 1920w`}
          sizes="100vw"
          width="1920"
          height="835"
        />
        <source
          media="(min-width: 620px)"
          srcSet={`${artwork}-tablet-compact.webp 800w, ${artwork}-tablet.webp 1200w`}
          sizes="100vw"
          width="1200"
          height="1050"
        />
        <img
          src={`${artwork}-portrait-compact.webp`}
          srcSet={`${artwork}-portrait-compact.webp 560w, ${artwork}-portrait.webp 900w`}
          sizes="100vw"
          width="900"
          height="1120"
          alt="Championship portraits of players from Dark Horse FC, Lucky Star FC and Offside Oracles FC"
          fetchpriority="high"
        />
      </picture>

      <Link to="/public" className="championship-cta" aria-label="Get Started">
        <ArrowDown size={23} strokeWidth={2} aria-hidden="true" />
      </Link>
    </section>
  );
}

export default HeroSection;
