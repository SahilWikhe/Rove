'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Heart,
  Home,
  MapPin,
  Navigation,
  ShieldCheck,
  Signal,
  Wifi,
  BatteryFull,
  CircleUserRound,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { pilotContactHref } from './site-config';

const stages = [
  {
    name: 'Plan',
    eyebrow: '01 / A FAMILIAR ROUTINE',
    title: (
      <>
        Your week.
        <br />
        <span>Already planned.</span>
      </>
    ),
    description:
      'The same appointment, the same days. We’re designing recurring rides that fit the rhythm of your care.',
    detail: 'One clear plan for the week ahead.',
    icon: CalendarDays,
  },
  {
    name: 'Ride',
    eyebrow: '02 / A LITTLE MORE CLARITY',
    title: (
      <>
        Know your ride.
        <br />
        <span>Before it arrives.</span>
      </>
    ),
    description:
      'A familiar name. A clear pickup window. A simple way to follow the journey, for you and the people in your corner.',
    detail: 'Less wondering. More peace of mind.',
    icon: Navigation,
  },
  {
    name: 'Return',
    eyebrow: '03 / THE WHOLE JOURNEY',
    title: (
      <>
        There for care.
        <br />
        <span>Then home to life.</span>
      </>
    ),
    description:
      'The ride home deserves just as much thought. We’re building return coordination into the journey from the start.',
    detail: 'Because getting there is only half the story.',
    icon: Home,
  },
];

function RouteMap({ stage }: { stage: number }) {
  return (
    <div className="route-map" aria-hidden="true">
      <svg viewBox="0 0 420 340" fill="none" className="map-lines">
        <defs>
          <linearGradient
            id={`route-gold-${stage}`}
            x1="78"
            y1="270"
            x2="320"
            y2="65"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9b773b" />
            <stop offset=".6" stopColor="#edca78" />
            <stop offset="1" stopColor="#fff0bd" />
          </linearGradient>
        </defs>
        <g stroke="#34382f" strokeWidth="9">
          <path d="M-20 110H155L193 150H450" />
          <path d="M-20 240H420" />
          <path d="M80 -10V360" />
          <path d="M300 -10V120L260 160V360" />
        </g>
        <g stroke="#1e221c" strokeWidth="6">
          <path d="M-20 110H155L193 150H450" />
          <path d="M-20 240H420" />
          <path d="M80 -10V360" />
          <path d="M300 -10V120L260 160V360" />
        </g>
        <g stroke="#282c25" strokeWidth="3">
          <path d="M-10 56H420M-10 190H420M-10 294H420M26 0V340M133 0V340M204 0V340M353 0V340" />
          <path d="M-15 335L435 5" />
        </g>
        <path
          d="M340 340C330 235 370 226 352 132C340 65 401 78 420 30"
          stroke="#283930"
          strokeWidth="23"
          opacity=".45"
        />
        <path
          className="gold-route"
          data-route-line={stage}
          d="M80 258V133Q80 111 102 111H155L192 150H235Q260 150 260 126V73"
          stroke={`url(#route-gold-${stage})`}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength="1"
        />
        <circle cx="80" cy="258" r="13" fill="#edca78" fillOpacity=".12" />
        <circle cx="80" cy="258" r="5" fill="#edca78" />
        <circle cx="260" cy="73" r="13" fill="#edca78" fillOpacity=".16" />
        <circle cx="260" cy="73" r="6" fill="#edca78" />
        <g
          className="map-car"
          data-route-car={stage}
          transform={stage === 1 ? 'translate(80 258)' : 'translate(260 73)'}
        >
          <circle cx="0" cy="0" r="19" fill="#edca78" fillOpacity=".08" />
          <rect x="-8" y="-13" width="16" height="27" rx="5" fill="#ead5a1" />
          <rect x="-5" y="-6" width="10" height="10" rx="2" fill="#20251d" />
        </g>
      </svg>
      <span className="map-label map-label-one">HOME</span>
      <span className="map-label map-label-two">CARE CENTER</span>
      <span className="map-neighborhood">NORTH CAROLINA</span>
    </div>
  );
}

function AppPhone() {
  return (
    <div className="phone-frame" aria-hidden="true">
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
        <div className="app-header">
          <span className="app-brand">
            rove<span>·</span>
          </span>
          <span className="profile-icon">
            <CircleUserRound size={22} />
          </span>
        </div>
        <div className="app-scenes">
          {[0, 1, 2].map((stage) => (
            <div className={`app-scene app-scene-${stage}`} key={stage}>
              {stage === 0 ? (
                <>
                  <div className="app-greeting">
                    <p>Good morning.</p>
                    <h3>
                      A little less
                      <br />
                      on your mind.
                    </h3>
                  </div>
                  <div className="week-picker">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <div
                        className={
                          i === 0 || i === 2 || i === 4 ? 'day planned' : 'day'
                        }
                        key={i}
                      >
                        <span>{day}</span>
                        <b>{7 + i}</b>
                        <i />
                      </div>
                    ))}
                  </div>
                  <div className="app-ride-card">
                    <div className="app-card-top">
                      <span>YOUR NEXT RIDE</span>
                      <span className="mini-badge">
                        <Check size={10} /> Planned
                      </span>
                    </div>
                    <div className="app-time">
                      7:15 <span>AM</span>
                    </div>
                    <p className="app-day">Monday, September 7</p>
                    <div className="app-stops">
                      <div>
                        <span className="stop-dot" />
                        <span>Home</span>
                      </div>
                      <div>
                        <MapPin size={13} />
                        <span>Your care center</span>
                      </div>
                    </div>
                    <div className="recurrence">
                      <CalendarDays size={14} /> Every Mon, Wed & Fri
                    </div>
                  </div>
                  <div className="app-hint">
                    <ShieldCheck size={18} />
                    <span>Your return is part of the plan.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="app-greeting">
                    <p>
                      {stage === 1
                        ? 'Your ride, at a glance.'
                        : 'The other half of the journey.'}
                    </p>
                    <h3>
                      {stage === 1 ? (
                        <>
                          On the way.
                          <br />
                          Right on your screen.
                        </>
                      ) : (
                        <>
                          Care, done.
                          <br />
                          Home, next.
                        </>
                      )}
                    </h3>
                  </div>
                  <RouteMap stage={stage} />
                  <div className="tracking-card">
                    <div className="tracking-title">
                      <div>
                        <span className="tracking-eyebrow">
                          {stage === 1 ? 'PICKUP WINDOW' : 'RETURN JOURNEY'}
                        </span>
                        <h4>
                          {stage === 1 ? '7:15–7:25 AM' : 'Let’s get you home.'}
                        </h4>
                      </div>
                      <span className="tracking-icon">
                        {stage === 1 ? (
                          <Navigation size={22} />
                        ) : (
                          <Home size={22} />
                        )}
                      </span>
                    </div>
                    <div className="driver-row">
                      <span className="driver-avatar">
                        <CircleUserRound size={29} />
                      </span>
                      <div>
                        <strong>
                          {stage === 1
                            ? 'Meet your driver'
                            : 'Your return, coordinated'}
                        </strong>
                        <span>
                          {stage === 1
                            ? 'Vehicle and arrival details'
                            : 'Updates for you and your care team'}
                        </span>
                      </div>
                      <ChevronRight size={16} />
                    </div>
                    <div className="app-action">
                      {stage === 1 ? 'Follow your ride' : 'View return plan'}
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
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
    </div>
  );
}

export default function RoveLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const stageRef = useRef(0);
  const showcaseRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [stage, setStage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const journey = journeyRef.current;
    const showcase = showcaseRef.current;
    const sticky = journey?.querySelector<HTMLElement>('.journey-sticky');
    if (!root || !journey || !showcase || !sticky) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const smooth = (from: number, to: number, value: number) => {
      const t = clamp((value - from) / (to - from));
      return t * t * (3 - 2 * t);
    };
    const routes = Array.from(
      journey.querySelectorAll<SVGPathElement>('[data-route-line]'),
    ).map((path) => ({
      path,
      car: journey.querySelector<SVGGElement>(
        `[data-route-car="${path.dataset.routeLine}"]`,
      ),
      length: path.getTotalLength(),
      returning: path.dataset.routeLine === '2',
    }));
    let frame = 0;
    let lastSolid = false;
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      // Use the actual sticky height, not the changing mobile browser viewport.
      const box = journey.getBoundingClientRect();
      const progress = clamp(
        -box.top / Math.max(1, journey.offsetHeight - sticky.offsetHeight),
      );
      const entry = smooth(height, 0, box.top);
      const heroProgress = Math.min(1, window.scrollY / height);
      root.style.setProperty('--hero-progress', String(heroProgress));
      if (!motion.matches) {
        const first = smooth(0.28, 0.38, progress);
        const second = smooth(0.61, 0.71, progress);
        journey.style.setProperty('--journey-progress', String(progress));
        journey.style.setProperty('--phone-entry', String(entry));
        journey.style.setProperty('--scene-plan', String(1 - first));
        journey.style.setProperty('--scene-ride', String(first * (1 - second)));
        journey.style.setProperty('--scene-return', String(second));
        journey.style.setProperty(
          '--phone-yaw',
          `${Math.sin(progress * Math.PI * 2) * 5}deg`,
        );
        journey.style.setProperty(
          '--phone-lift',
          `${Math.sin(progress * Math.PI * 2) * -11}px`,
        );
        journey.style.setProperty('--light-position', `${15 + progress * 80}%`);
        const next = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;
        if (next !== stageRef.current) {
          stageRef.current = next;
          setStage(next);
        }
        for (const route of routes) {
          const amount = route.returning
            ? 1 - smooth(0.65, 0.96, progress)
            : smooth(0.3, 0.63, progress);
          const point = route.path.getPointAtLength(amount * route.length);
          const ahead = route.path.getPointAtLength(
            Math.min(route.length, amount * route.length + 1),
          );
          const behind = route.path.getPointAtLength(
            Math.max(0, amount * route.length - 1),
          );
          const angle =
            (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) /
              Math.PI +
            90 +
            (route.returning ? 180 : 0);
          route.car?.setAttribute(
            'transform',
            `translate(${point.x} ${point.y}) rotate(${angle})`,
          );
          route.path.style.strokeDashoffset = String(1 - amount);
        }
      }
      const solid = window.scrollY > height * 0.75;
      if (lastSolid !== solid) {
        lastSolid = solid;
        setNavSolid(solid);
      }
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const fitPhone = () => {
      // Fits the complete device between the copy and progress indicator on any screen.
      const scale = Math.min(
        1,
        (showcase.clientHeight - 40) / 646,
        (showcase.clientWidth - 38) / 360,
      );
      journey.style.setProperty(
        '--device-scale',
        String(Math.max(0.25, scale)),
      );
      requestUpdate();
    };
    const updateMotion = () => {
      setReducedMotion(motion.matches);
      fitPhone();
    };
    updateMotion();
    root.classList.add('js-ready');
    motion.addEventListener('change', updateMotion);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', fitPhone);
    const resizeObserver = new ResizeObserver(fitPhone);
    resizeObserver.observe(showcase);
    resizeObserver.observe(sticky);
    update();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.13 },
    );
    root.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', fitPhone);
      motion.removeEventListener('change', updateMotion);
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menuOpen]);

  const changeStage = (value: unknown) => {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 0 || next > 2) return;
    stageRef.current = next;
    setStage(next);
    if (!reducedMotion && journeyRef.current) {
      const el = journeyRef.current;
      const positions = [0.12, 0.48, 0.82];
      window.scrollTo({
        top:
          window.scrollY +
          el.getBoundingClientRect().top +
          (el.offsetHeight -
            (el.querySelector<HTMLElement>('.journey-sticky')?.offsetHeight ??
              window.innerHeight)) *
            positions[next],
        behavior: 'instant',
      });
    }
  };
  const closeMenu = () => setMenuOpen(false);
  const detail = stages[stage];
  const DetailIcon = detail.icon;

  return (
    <div ref={rootRef} className="rove-site" data-stage={stage}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`site-nav ${navSolid ? 'nav-solid' : ''}`}>
        <a
          className="wordmark"
          href="#top"
          aria-label="Rove home"
          onClick={closeMenu}
        >
          rove<span>·</span>
        </a>
        <button
          className="menu-toggle"
          ref={menuButtonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav
          className={menuOpen ? 'nav-links open' : 'nav-links'}
          aria-label="Main navigation"
          id="main-navigation"
        >
          <a href="#experience" onClick={closeMenu}>
            The experience
          </a>
          <a href="#purpose" onClick={closeMenu}>
            Our purpose
          </a>
          <a href="#pilot" className="nav-cta" onClick={closeMenu}>
            Our first chapter <ArrowUpRight size={16} />
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero" id="top">
          <div className="hero-image-wrap">
            <img
              className="hero-image"
              src="/rove-journey.webp"
              alt="A quiet winding road into the North Carolina hills, traced with warm evening light."
              width="1672"
              height="941"
              fetchPriority="high"
            />
            <div className="hero-scrim" />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> A NEW DIRECTION IN CARE
              TRANSPORTATION
            </p>
            <h1>
              A better way
              <br />
              to <span>get there.</span>
            </h1>
            <p className="hero-description">
              Life has places for you to be.
              <br />
              We’re building a better way to reach them.
            </p>
            <a className="button gold" href="#experience">
              Explore the journey <ArrowDown size={18} />
            </a>
          </div>
          <div className="hero-footer">
            <span>PRELAUNCH · NORTH CAROLINA</span>
            <a href="#experience">
              <span className="scroll-line" /> SCROLL TO DISCOVER{' '}
              <ArrowDown size={14} />
            </a>
          </div>
        </section>

        <section className="intro" id="experience">
          <div className="reveal">
            <p className="eyebrow">INTRODUCING ROVE</p>
            <h2>
              Care has a rhythm.
              <br />
              <span>Your ride should, too.</span>
            </h2>
            <p>
              Some journeys are part of your life.
              <br />
              We’re making the ride to recurring care feel like it belongs.
            </p>
          </div>
          <a className="subtle-link" href="#journey">
            Step inside the experience <ArrowDown size={16} />
          </a>
        </section>

        <section
          className="journey"
          ref={journeyRef}
          id="journey"
          aria-label="Explore the Rove product concept"
        >
          <div className="journey-sticky">
            <div className="journey-atmosphere" />
            <div className="journey-topline">
              <span>THE ROVE EXPERIENCE</span>
              <a href="#purpose">
                Skip the preview <ArrowDown size={13} />
              </a>
            </div>
            <div className="journey-layout">
              <div className="journey-copy">
                <Tabs
                  value={String(stage)}
                  onValueChange={changeStage}
                  className="journey-tabs"
                >
                  <TabsList
                    aria-label="Explore the three stages of a Rove journey"
                    className="journey-tablist"
                    variant="line"
                  >
                    {stages.map((item, i) => (
                      <TabsTrigger
                        className="journey-tab"
                        value={String(i)}
                        key={item.name}
                      >
                        <span>0{i + 1}</span>
                        {item.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {stages.map((item, i) => (
                    <TabsContent value={String(i)} key={item.name}>
                      <div className="stage-copy">
                        <p className="eyebrow">{item.eyebrow}</p>
                        <h2>{item.title}</h2>
                        <p className="stage-description">{item.description}</p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                <div className="journey-detail">
                  <DetailIcon size={19} />
                  <span>{detail.detail}</span>
                </div>
                <p className="preview-note">
                  A look at what’s ahead. Illustrative app concept.
                </p>
              </div>
              <figure className="phone-showcase" ref={showcaseRef}>
                <div className="phone-halo" />
                <div className="phone-assembly">
                  <AppPhone />
                  <div className={`floating-note note-${stage}`} key={stage}>
                    {stage === 0 ? (
                      <CalendarDays size={21} />
                    ) : stage === 1 ? (
                      <Navigation size={21} />
                    ) : (
                      <CheckCheck size={21} />
                    )}
                    <div>
                      <strong>
                        {stage === 0
                          ? 'A routine you can see.'
                          : stage === 1
                            ? 'Your circle, in the loop.'
                            : 'All the way home.'}
                      </strong>
                      <span>
                        {stage === 0
                          ? 'Your week, in one place.'
                          : stage === 1
                            ? 'A little reassurance goes a long way.'
                            : 'Every part of the journey matters.'}
                      </span>
                    </div>
                  </div>
                </div>
                <figcaption>ROVE APP · PRODUCT PREVIEW</figcaption>
              </figure>
            </div>
            <div className="journey-progress">
              <span>THE RIDE THERE</span>
              <div>
                <i />
              </div>
              <span>THE WAY HOME</span>
            </div>
          </div>
        </section>

        <section className="purpose section-wrap" id="purpose">
          <div className="section-top reveal">
            <p className="eyebrow">MORE THAN A RIDE</p>
            <h2>
              For you.
              <br />
              <span>And your whole circle.</span>
            </h2>
            <p>
              Good transportation connects more than places.
              <br />
              It connects the people who make care possible.
            </p>
          </div>
          <div className="circle-grid">
            <article className="circle-card reveal">
              <div className="mini-ui family-ui" aria-hidden="true">
                <span className="circle-avatar">
                  <Heart size={26} />
                </span>
                <div className="mini-notification">
                  <span className="status-dot" />
                  <div>
                    <strong>A little peace of mind.</strong>
                    <span>The people you choose, kept close.</span>
                  </div>
                  <CheckCheck size={18} />
                </div>
              </div>
              <span className="card-kicker">FOR RIDERS & FAMILIES</span>
              <h3>
                A little less worry.
                <br />A lot more living.
              </h3>
              <p>
                Recurring plans and ride updates, designed for the person riding
                and the people who care about them.
              </p>
            </article>
            <article className="circle-card reveal">
              <div className="mini-ui care-ui" aria-hidden="true">
                <div className="care-top">
                  <Building2 size={17} />
                  <span>Today’s journeys</span>
                  <span className="mini-tag">Preview</span>
                </div>
                {[
                  ['7:15', 'Outbound', 'Planned'],
                  ['11:30', 'Return', 'Coordinating'],
                  ['1:00', 'Outbound', 'Planned'],
                ].map((row) => (
                  <div className="mini-table-row" key={row[0]}>
                    <span>{row[0]}</span>
                    <strong>{row[1]}</strong>
                    <span className="mini-state">{row[2]}</span>
                  </div>
                ))}
              </div>
              <span className="card-kicker">FOR CARE TEAMS</span>
              <h3>
                More time for care.
                <br />
                Less chasing rides.
              </h3>
              <p>
                A clearer picture of recurring journeys, so transportation is
                easier to coordinate around the appointment.
              </p>
            </article>
            <article className="circle-card reveal">
              <div className="mini-ui driver-ui" aria-hidden="true">
                <div className="driver-route">
                  <span>
                    <Navigation size={18} />
                  </span>
                  <div />
                  <span>
                    <MapPin size={18} />
                  </span>
                </div>
                <p>
                  Every familiar route.
                  <br />
                  <strong>A meaningful difference.</strong>
                </p>
              </div>
              <span className="card-kicker">FOR DRIVERS</span>
              <h3>
                A familiar route.
                <br />A real purpose.
              </h3>
              <p>
                We envision scheduled work with a human connection. A chance to
                become part of someone’s routine.
              </p>
            </article>
          </div>
        </section>

        <section className="manifesto section-wrap">
          <div className="manifesto-heading reveal">
            <p className="eyebrow">WHY WE’RE HERE</p>
            <h2>
              The appointment
              <br />
              is important.
              <br />
              <span>
                So is the life
                <br />
                around it.
              </span>
            </h2>
          </div>
          <div className="manifesto-copy reveal">
            <span className="large-quote">“</span>
            <p>Getting to care shouldn’t take over your day.</p>
            <p className="manifesto-body">
              The early mornings. The standing appointments. The waiting to get
              home. We’re starting Rove with these everyday moments in mind.
            </p>
            <p className="manifesto-body">
              Our first focus is recurring dialysis transportation in North
              Carolina. One community. A thoughtful beginning.
            </p>
            <a className="text-link" href="#pilot">
              Our first chapter <ArrowUpRight size={18} />
            </a>
          </div>
        </section>

        <section className="pilot" id="pilot">
          <div className="pilot-content reveal">
            <p className="eyebrow">
              <span className="status-dot" /> OUR FIRST CHAPTER · NORTH CAROLINA
            </p>
            <h2>
              Let’s move
              <br />
              care forward.
            </h2>
            <p>
              We’re developing Rove alongside the people who understand
              <br className="desktop-break" /> these journeys best. Riders, care
              teams, and drivers.
            </p>
            {pilotContactHref ? (
              <a className="button dark-button" href={pilotContactHref}>
                Talk about a pilot <ArrowUpRight size={18} />
              </a>
            ) : (
              <a className="button dark-button" href="#experience">
                Discover what’s ahead <ArrowUpRight size={18} />
              </a>
            )}
            <span className="pilot-note">
              In development. Our app and ride service are not yet available.
            </span>
          </div>
          <div className="pilot-wordmark" aria-hidden="true">
            rove
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a className="wordmark" href="#top" aria-label="Back to top">
            rove<span>·</span>
          </a>
          <p>A better way to get there.</p>
          <a href="#top" className="back-top">
            Back to top <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Rove</span>
          <span>Designed around the journeys that matter.</span>
          <span>North Carolina, USA</span>
        </div>
      </footer>
    </div>
  );
}
