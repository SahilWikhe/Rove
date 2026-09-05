'use client';

import { useEffect, useId, useRef } from 'react';
import { Building2, Home, ArrowRight } from 'lucide-react';

// A schematic round trip, kept separate from the illustrative gold artwork.
const roundTrip =
  'M 150 268 C 165 90 465 56 672 112 C 839 150 890 225 850 290 C 780 434 501 481 310 403 C 192 355 143 330 150 268 Z';

export default function JourneyArtwork() {
  const figureRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const routeId = useId();

  useEffect(() => {
    const figure = figureRef.current;
    const svg = svgRef.current;
    if (!figure || !svg) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const syncPlayback = () => {
      const playing = visible && !preference.matches && !document.hidden;
      figure.dataset.playing = String(playing);
      if (playing) svg.unpauseAnimations();
      else svg.pauseAnimations();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0 },
    );
    observer.observe(figure);
    syncPlayback();
    preference.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
      svg.pauseAnimations();
    };
  }, []);

  return (
    <figure
      className="journey-artwork"
      ref={figureRef}
      data-playing="false"
      aria-label="A complete journey from home to care and back home"
    >
      <div className="journey-art-stage" aria-hidden="true">
        <div className="journey-art-depth">
          <div className="journey-art-float">
            <img
              className="journey-loop-image"
              src="/rove-gold-loop.webp"
              width="1536"
              height="1024"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              className="journey-loop-image journey-loop-light"
              src="/rove-gold-loop.webp"
              width="1536"
              height="1024"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <svg
            className="journey-signal-map"
            ref={svgRef}
            viewBox="0 0 1000 560"
            fill="none"
          >
            <defs>
              <path id={routeId} d={roundTrip} pathLength="1000" />
            </defs>
            <use href={`#${routeId}`} className="journey-signal-track" />
            <use href={`#${routeId}`} className="journey-signal-trail" />
            {[0, 4, 8].map((begin) => (
              <g key={begin} className="journey-signal">
                <circle r="18" fill="#edca78" opacity="0.07" />
                <circle r="8" fill="#edca78" opacity="0.18" />
                <circle r="2.5" fill="#fff3c9" />
                <animateMotion
                  dur="12s"
                  begin={`-${begin}s`}
                  repeatCount="indefinite"
                  path={roundTrip}
                  calcMode="paced"
                />
              </g>
            ))}
          </svg>
        </div>
        <div className="journey-art-center">
          <span className="art-center-eyebrow">THERE. AND BACK.</span>
          <span className="art-center-title">One complete journey.</span>
          <span className="art-center-line">Built around your life.</span>
        </div>
        <div className="journey-waypoint waypoint-home">
          <span className="waypoint-icon">
            <Home size={20} />
          </span>
          <span>
            <strong>Home</strong>
            <small>Where life happens.</small>
          </span>
        </div>
        <div className="journey-waypoint waypoint-care">
          <span className="waypoint-icon">
            <Building2 size={20} />
          </span>
          <span>
            <strong>Care</strong>
            <small>Part of your rhythm.</small>
          </span>
        </div>
        <span className="journey-direction direction-there">
          THE RIDE THERE <ArrowRight size={12} />
        </span>
        <span className="journey-direction direction-home">
          <ArrowRight size={12} /> THE WAY HOME
        </span>
      </div>
      <figcaption className="journey-art-caption">
        Every part of the journey matters.
      </figcaption>
    </figure>
  );
}
