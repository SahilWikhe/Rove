'use client';

import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  BatteryFull,
  CalendarDays,
  Check,
  CheckCheck,
  CircleUserRound,
  Heart,
  Home,
  MapPin,
  Navigation,
  ShieldCheck,
  Signal,
  Wifi,
} from 'lucide-react';

const demoRoute =
  'M72 175V127Q72 107 92 107H134Q149 107 159 93L173 80Q187 68 202 68H232';

function DemoMap() {
  return (
    <div className="demo-map" data-animate="map">
      <svg viewBox="0 0 306 320" fill="none">
        <g stroke="#283026" strokeWidth="12">
          <path d="M-20 68H330M-20 175H330M72-20V340M232-20V340" />
          <path d="M-10 107H142L185 68M-10 303L330 176" />
        </g>
        <g stroke="#161d15" strokeWidth="8">
          <path d="M-20 68H330M-20 175H330M72-20V340M232-20V340" />
          <path d="M-10 107H142L185 68M-10 303L330 176" />
        </g>
        <g stroke="#252d22" strokeWidth="2">
          <path d="M26 0V320M120 0V116M120 160V320M178 130V320M277 0V320M0 24H306M0 190H306M0 276H170" />
        </g>
        <path d={demoRoute} stroke="#edca78" strokeWidth="13" opacity=".07" />
        <path d={demoRoute} stroke="#806c40" strokeWidth="3" />
        <path
          className="demo-route"
          data-animate="route"
          d={demoRoute}
          stroke="#f0ce81"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="1"
        />
        <circle
          cx="72"
          cy="175"
          r="7"
          fill="#141a11"
          stroke="#edca78"
          strokeWidth="2"
        />
        <circle
          className="demo-destination-ring"
          data-animate="destination"
          cx="232"
          cy="68"
          r="20"
          stroke="#edca78"
        />
        <circle cx="232" cy="68" r="6" fill="#edca78" />
      </svg>
      <span className="demo-map-home">Home</span>
      <span className="demo-map-care">Your care center</span>
      <span
        className="demo-map-marker"
        data-animate="marker"
        style={{ offsetPath: `path('${demoRoute}')` }}
      >
        <Navigation size={13} fill="currentColor" />
      </span>
    </div>
  );
}

/** A synchronized CSS timeline; visibility only controls playback, never React frames. */
export default function HeroPhone() {
  const previewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const syncPlayback = () => {
      preview.dataset.playing = String(
        visible && !document.hidden && !motion.matches,
      );
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.15 },
    );
    observer.observe(preview);
    document.addEventListener('visibilitychange', syncPlayback);
    motion.addEventListener('change', syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      motion.removeEventListener('change', syncPlayback);
    };
  }, []);

  return (
    <figure
      className="hero-product hero-demo"
      ref={previewRef}
      data-playing="false"
    >
      <div className="hero-device" aria-hidden="true">
        <div className="phone-frame demo-phone">
          <div className="phone-button" />
          <div className="phone-screen">
            <div className="phone-status">
              <span>7:08</span>
              <span className="island" />
              <span className="phone-signals">
                <Signal size={13} />
                <Wifi size={13} />
                <BatteryFull size={17} />
              </span>
            </div>
            <div className="demo-live-activity" data-animate="activity">
              <span /> Your ride is on its way <Navigation size={10} />
            </div>
            <div className="app-header">
              <span className="app-brand">
                rove<span>·</span>
              </span>
              <span className="profile-icon">
                <CircleUserRound size={22} />
              </span>
            </div>

            <div className="demo-scenes">
              <div className="demo-scene demo-plan" data-animate="plan">
                <div className="demo-heading">
                  <p>Good morning.</p>
                  <h3>
                    Your week.
                    <br />
                    <span>Already handled.</span>
                  </h3>
                </div>
                <div className="demo-week">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <span
                      className={`demo-day demo-day-${index}`}
                      data-animate="day"
                      key={index}
                    >
                      <span>{day}</span>
                      <b>{7 + index}</b>
                      <i />
                    </span>
                  ))}
                </div>
                <div className="demo-ride-card" data-animate="card">
                  <div className="demo-card-label">
                    <span>YOUR NEXT RIDE</span>
                    <span>
                      <Check size={10} /> Planned
                    </span>
                  </div>
                  <div className="demo-time">
                    7:15 <span>AM</span>
                  </div>
                  <p className="demo-date">Monday, September 7</p>
                  <div className="demo-stops">
                    <span>
                      <Home size={14} /> Home
                    </span>
                    <i />
                    <span>
                      <MapPin size={14} /> Your care center
                    </span>
                  </div>
                  <div className="demo-repeat">
                    <CalendarDays size={13} />
                    <span>Every Mon, Wed & Fri</span>
                    <CheckCheck size={14} data-animate="saved" />
                  </div>
                </div>
                <div className="demo-follow" data-animate="follow">
                  Follow your ride <ArrowRight size={16} />
                  <span className="demo-tap" data-animate="tap" />
                </div>
                <p className="demo-reassurance">
                  <ShieldCheck size={13} /> Your return is part of the plan.
                </p>
              </div>

              <div className="demo-scene demo-ride" data-animate="ride">
                <div className="demo-heading">
                  <p>A little more peace of mind.</p>
                  <h3>
                    On the way.
                    <br />
                    <span>In the know.</span>
                  </h3>
                </div>
                <DemoMap />
                <div className="demo-tracking" data-animate="tracking">
                  <div className="demo-tracking-top">
                    <span className="demo-driver">
                      <CircleUserRound size={29} />
                      <i />
                    </span>
                    <div>
                      <b>Your ride is on its way</b>
                      <span>Heading to your care center</span>
                    </div>
                  </div>
                  <div className="demo-eta">
                    <span>ESTIMATED ARRIVAL</span>
                    <div>
                      <b className="demo-eta-first" data-animate="eta-first">
                        7:25
                      </b>
                      <b className="demo-eta-last" data-animate="eta-last">
                        7:24
                      </b>
                      <small>AM</small>
                    </div>
                    <span className="demo-live">
                      <i /> On track
                    </span>
                  </div>
                  <div className="demo-trip-progress">
                    <i data-animate="trip-progress" />
                  </div>
                </div>
              </div>

              <div className="demo-scene demo-arrive" data-animate="arrive">
                <p className="demo-arrive-eyebrow">
                  ONE LESS THING TO THINK ABOUT
                </p>
                <div className="demo-arrival-mark">
                  <span data-animate="arrival-ring" />
                  <span data-animate="arrival-ring-two" />
                  <div data-animate="arrival-icon">
                    <Check size={43} strokeWidth={1.7} />
                  </div>
                </div>
                <div className="demo-heading">
                  <h3>
                    You’re here.
                    <br />
                    <span>We’re still with you.</span>
                  </h3>
                  <p>Take a moment. We’ve got the next part.</p>
                </div>
                <div className="demo-return-card" data-animate="return-card">
                  <span>
                    <Home size={21} />
                  </span>
                  <div>
                    <b>Home is in the plan.</b>
                    <p>Your return, coordinated.</p>
                  </div>
                  <CheckCheck size={18} />
                </div>
                <div
                  className="demo-circle-update"
                  data-animate="circle-update"
                >
                  <span>
                    <Heart size={14} />
                  </span>
                  <p>Your circle, kept in the loop.</p>
                </div>
              </div>
            </div>
            <div className="app-nav">
              <span className="selected">
                <Home size={18} />
                Home
              </span>
              <span>
                <CalendarDays size={18} />
                My rides
              </span>
              <span>
                <Heart size={18} />
                My circle
              </span>
            </div>
            <div className="home-indicator" />
          </div>
          <div
            className="demo-notification demo-notification-plan"
            data-animate="notification-plan"
          >
            <span className="demo-notification-icon">
              <CalendarDays size={19} />
            </span>
            <div>
              <b>Your week is ready.</b>
              <span>Three rides. One less worry.</span>
            </div>
            <Check size={15} />
          </div>
          <div
            className="demo-notification demo-notification-arrive"
            data-animate="notification-arrive"
          >
            <span className="demo-notification-icon">
              <ShieldCheck size={20} />
            </span>
            <div>
              <b>Made it, together.</b>
              <span>Your circle has been updated.</span>
            </div>
            <CheckCheck size={16} />
          </div>
        </div>
      </div>
      <figcaption>
        <span className="demo-chapters" aria-hidden="true">
          <span data-animate="chapter-plan">
            Plan
            <i>
              <b data-animate="progress-plan" />
            </i>
          </span>
          <span data-animate="chapter-ride">
            Ride
            <i>
              <b data-animate="progress-ride" />
            </i>
          </span>
          <span data-animate="chapter-arrive">
            Arrive
            <i>
              <b data-animate="progress-arrive" />
            </i>
          </span>
        </span>
        ROVE APP · CONCEPT PREVIEW
        <span className="sr-only">
          {' '}
          A looping illustration of planning a recurring ride, following the
          journey, and arriving with a coordinated return.
        </span>
      </figcaption>
    </figure>
  );
}
