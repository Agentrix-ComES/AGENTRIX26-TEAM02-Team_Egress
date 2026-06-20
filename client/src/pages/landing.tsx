import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Camera,
  Compass,
  GaugeCircle,
  Globe2,
  Hotel,
  Landmark,
  MapPinned,
  ShieldAlert,
  Sparkles,
  TrainFront,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";

const HERO = "/landing/Hero.png";
const ICON = "/landing/Icon.png";
const FRAME_BAND = "/landing/Frame%2020.png";
const FRAME_CTA = "/landing/Frame%20101.png";
const COVER_1 = "/landing/bcoverImage.png";
const COVER_2 = "/landing/bcoverImage1.png";
const COVER_3 = "/landing/bcoverImage2.png";
const CONTACT_BG = "/landing/Img4.jpg";

const PLAN_1 = "/landing/sigiriya.png";
const PLAN_2 = "/landing/9-arch.jpg";
const PLAN_3 = "/landing/galle.png";

const PARTNER_1 = "/landing/kandyperahara.png";
const PARTNER_2 = "/landing/trainwithgirl.png";
const PARTNER_3 = "/landing/tea.png";
const PARTNER_4 = "/landing/elephant.png";
const PARTNER_5 = "/landing/3wheelr.png";

export function LandingPage() {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setZoomed(true), 2400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0B2838] prompt-font overflow-x-hidden">
      <TopNav />

      {/* ---------------- HERO ---------------- */}
      <section className="relative w-full overflow-hidden">
        <img
          src={HERO}
          alt="Sri Lanka landscape"
          className="w-full h-auto select-none origin-bottom"
          style={{
            willChange: "transform",
            transformOrigin: "bottom center",
            transition: "transform 5500ms cubic-bezier(0.22, 1, 0.36, 1)",
            transform: zoomed
              ? "translateY(-50%) scale(1.22)"
              : "translateY(0) scale(1)",
          }}
          draggable={false}
        />

        {/* overlay copy — left */}
        <div
          className="absolute left-4 md:left-10 lg:left-16 bottom-[120px] md:bottom-[210px] max-w-[640px]"
          style={{
            willChange: "transform",
            transition: "transform 5500ms cubic-bezier(0.22, 1, 0.36, 1)",
            transform: zoomed ? "translateY(-350px)" : "translateY(0)",
          }}
        >
          <p className="text-[14px] md:text-[18px] text-[#0B2838]">
            A living timeline for travel in
          </p>
          <p className="qwigley-font text-[#D68631] leading-none text-[60px] md:text-[88px]">
            Sri Lanka
          </p>
          <p className="text-[12px] md:text-[15px] text-[#0B2838] max-w-[420px]">
            Plan, track, and recover your trip with four AI agents that reshape the day when the
            world changes.
          </p>
        </div>

        {/* CTA — right */}
        <Link
          to="/workspace"
          className="absolute right-6 md:right-14 lg:right-20 bottom-[160px] md:bottom-[240px] inline-flex items-center justify-center gap-2 w-[160px] md:w-[200px] h-[48px] md:h-[52px] text-white bg-[#D68631] font-medium rounded-[14px] shadow-md hover:bg-[#b96f24]"
          style={{
            willChange: "transform",
            transition: "transform 5500ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms",
            transform: zoomed ? "translateY(-350px)" : "translateY(0)",
          }}
        >
          Open Workspace
          <img src={ICON} alt="" className="w-4 h-4 md:w-6 md:h-6" />
        </Link>

        {/* centered tagline */}
        <div className="absolute bottom-[40px] md:bottom-[50px] left-1/2 -translate-x-1/2 text-center w-full px-4">
          <h1 className="text-[36px] md:text-[56px] text-[#10465E] font-light">
            Travel that reschedules itself
          </h1>
          <p className="mt-3 text-[13px] md:text-[16px] font-medium text-black/80 max-w-[820px] mx-auto">
            Four specialized agents — Planner, Logistics, Disruption, and Culture — coordinate
            under a Trip Orchestrator that watches your timeline and rebuilds the rest of the
            day when a train delays, a storm closes a road, or a temple ceremony runs long.
          </p>
        </div>
      </section>

      {/* ---------------- THREE FEATURE CARDS ---------------- */}
      <section className="px-4 md:px-8 mt-16">
        <div className="grid gap-6 md:grid-cols-3 max-w-[1200px] mx-auto">
          <FeatureCard
            image={COVER_1}
            title="Living Timeline"
            body="Every trip is a sequence of time-aware nodes — transport, stays, visits, meals, temples — that the platform monitors as the day unfolds."
            cta="See Workspace"
            to="/workspace"
            icon={CalendarClock}
          />
          <FeatureCard
            image={COVER_2}
            title="Disruption Recovery"
            body="Delays, closures, storms, traffic — propagated through the rest of the day with proposed recovery plans, not just alerts."
            cta="View Alerts"
            to="/alerts"
            icon={ShieldAlert}
          />
          <FeatureCard
            image={COVER_3}
            title="Cultural Awareness"
            body="Dress codes, photography rules, religious timing, and festival impacts surfaced before you arrive at every temple and shrine."
            cta="Plan a Trip"
            to="/plan"
            icon={Globe2}
          />
        </div>
      </section>

      {/* ---------------- WIDE BAND ---------------- */}
      <section className="mt-20 px-4">
        <div className="relative max-w-[1300px] mx-auto">
          <img src={FRAME_BAND} alt="" className="w-full h-auto select-none" draggable={false} />
          <div className="absolute inset-0 grid place-items-center text-center px-6">
            <div>
              <p className="qwigley-font text-[#D68631] text-[44px] md:text-[64px] leading-none">
                One trip, four agents
              </p>
              <p className="mt-2 text-[13px] md:text-[16px] text-[#0B2838] max-w-[720px] mx-auto">
                The Trip Orchestrator splits work across Planner, Logistics, Disruption, and
                Culture &amp; Etiquette agents — and resolves the conflicts before they reach you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- PLAN YOUR TRIP ---------------- */}
      <section className="mt-20 px-4">
        <div className="text-center max-w-[820px] mx-auto">
          <h2 className="text-[36px] md:text-[56px] text-[#0B2838] font-light leading-tight">
            Plan Your Trip
          </h2>
          <p className="mt-3 text-[14px] md:text-[18px] text-black/70">
            Seamlessly orchestrate your Sri Lankan journey — from ancient cities and hill-country
            trains to coastal forts.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-[1100px] mx-auto">
          <FacilityCard
            image={PLAN_1}
            tag="Cultural Triangle"
            title="Plan"
            body="Give the agents your dates, budget, dietary needs, and interests — get a complete timeline in seconds."
            icon={Wand2}
          />
          <FacilityCard
            image={PLAN_2}
            tag="Hill Country"
            title="Track"
            body="The orchestrator watches your active node, weather, transport feeds, and bookings as the day plays out."
            icon={GaugeCircle}
          />
          <FacilityCard
            image={PLAN_3}
            tag="Coastal South"
            title="Adapt"
            body="When something slips, downstream nodes shift, conflicts surface, and recovery options arrive instantly."
            icon={Sparkles}
          />
        </div>
      </section>

      {/* ---------------- PARTNER SECTION ---------------- */}
      <section className="mt-24 px-4">
        <div className="text-center max-w-[820px] mx-auto">
          <h2 className="text-[36px] md:text-[56px] text-[#0B2838] font-light leading-tight">
            Are You a <br className="md:hidden" />
            Travel Solution Provider?
          </h2>
          <p className="mt-3 text-[14px] md:text-[18px] text-black/70">
            Plug your inventory into Sri Lanka's intelligent travel platform.
          </p>
        </div>

        <div className="mt-12 max-w-[1200px] mx-auto">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PartnerCard image={PARTNER_1} icon={Landmark} title="Festivals & Events" body="Showcase your perahera, esala, or seasonal program — surfaced when it matters." />
            <PartnerCard image={PARTNER_2} icon={TrainFront} title="Transport" body="Trains, private cars, tuk-tuks, transfers — bookable and disruption-aware." />
            <PartnerCard image={PARTNER_3} icon={Hotel} title="Stays & Boutique" body="Hotels and homestays appear in timelines tuned to traveler pace and budget." />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-[820px] mx-auto">
            <PartnerCard image={PARTNER_4} icon={Camera} title="Activities & Wildlife" body="Yala, Wilpattu, whale-watching, hikes — slot directly into adaptive itineraries." />
            <PartnerCard image={PARTNER_5} icon={UtensilsCrossed} title="Food & Local Operators" body="Restaurants and guides matched to dietary needs, language, and itinerary flow." />
          </div>
        </div>
      </section>

      {/* ---------------- CTA BANNER ---------------- */}
      <section className="mt-24 px-4">
        <div className="relative max-w-[1400px] mx-auto">
          <img src={FRAME_CTA} alt="" className="w-full h-auto select-none" draggable={false} />
          <Link
            to="/admin"
            className="absolute left-1/2 -translate-x-1/2 bottom-[60px] md:bottom-[100px] inline-flex items-center justify-center gap-2 w-[180px] md:w-[240px] h-[48px] md:h-[52px] text-white bg-[#D68631] text-[14px] md:text-[16px] font-medium rounded-[14px] shadow-md hover:bg-[#b96f24] transition-colors"
          >
            Register as Partner
            <img src={ICON} alt="" className="w-4 h-4 md:w-6 md:h-6" />
          </Link>
        </div>
      </section>

      {/* ---------------- CONTACT ---------------- */}
      <section className="mt-24 px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-stretch gap-10 max-w-[1100px] mx-auto">
          <div className="flex-1 flex flex-col justify-center text-center md:text-left">
            <p className="qwigley-font text-[#D68631] leading-none text-[60px] md:text-[88px]">
              Stay in the loop
            </p>
            <p className="mt-4 text-[14px] md:text-[16px] text-[#0B2838]/90 leading-relaxed max-w-[480px] md:mx-0 mx-auto">
              Want a demo, partner API access, or a custom integration? Drop us a note — the
              orchestrator team responds within one business day.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm md:mx-0 mx-auto text-left">
              <Stat label="Agents" value="4" />
              <Stat label="Domain services" value="7" />
              <Stat label="External feeds" value="5" />
              <Stat label="Latency p95" value="~640ms" />
            </div>
          </div>

          <div className="relative w-full md:w-[442px] h-[560px] rounded-[14px] overflow-hidden shadow-lg">
            <img
              src={CONTACT_BG}
              alt=""
              className="object-cover w-full h-full"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/35" />
            <form
              onSubmit={(e) => e.preventDefault()}
              className="absolute inset-0 flex flex-col gap-5 p-8 pt-16"
            >
              <FormField label="Name" placeholder="Your name" />
              <FormField label="Email" type="email" placeholder="you@email.com" />
              <FormField label="Message" placeholder="Tell us what you're building…" />
              <button
                type="submit"
                className="self-start inline-flex items-center justify-center gap-2 w-[160px] md:w-[186px] h-[48px] md:h-[52px] text-white bg-[#D68631] text-[14px] md:text-[16px] font-medium rounded-[14px] shadow-md hover:bg-[#b96f24] transition-colors"
              >
                Contact Us
                <img src={ICON} alt="" className="w-4 h-4 md:w-6 md:h-6" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ---------- subcomponents ---------- */

function TopNav() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid place-items-center h-9 w-9 rounded-lg bg-[#D68631] text-white">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-semibold text-[#0B2838]">Egress</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#0B2838]/80">
          <a href="#features" className="hover:text-[#D68631]">Features</a>
          <a href="#plan" className="hover:text-[#D68631]">Plan</a>
          <a href="#partners" className="hover:text-[#D68631]">Partners</a>
          <Link to="/app" className="hover:text-[#D68631]">Dashboard</Link>
        </nav>
        <Link
          to="/workspace"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-[#0B2838] text-white text-sm hover:bg-[#10465E]"
        >
          Open Workspace <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

interface FeatureCardProps {
  image: string;
  title: string;
  body: string;
  cta: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}
function FeatureCard({ image, title, body, cta, to, icon: Icon }: FeatureCardProps) {
  return (
    <div className="relative flex flex-col justify-between p-3 transition duration-200 ease-in-out border border-[#D68631]/60 shadow-lg cursor-pointer rounded-[30px] bg-white h-[440px] hover:bg-[#D68631] group">
      <img
        src={image}
        alt=""
        className="object-cover rounded-[26px] w-full h-[230px]"
        draggable={false}
      />
      <div className="px-2 mt-3 text-left">
        <div className="flex items-center gap-2 text-[#D68631] group-hover:text-white">
          <Icon className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">{title}</span>
        </div>
        <p className="text-[15px] font-light text-[#0B2838] mt-2 group-hover:text-white">
          {body}
        </p>
        <Link
          to={to}
          className="mt-4 inline-flex items-center justify-center gap-2 w-[180px] h-[44px] text-white bg-[#D68631] text-[14px] font-medium rounded-[14px] group-hover:bg-[#0B2838] transition-colors"
        >
          {cta}
          <img src={ICON} alt="" className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

interface FacilityCardProps {
  image: string;
  tag: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
}
function FacilityCard({ image, tag, title, body, icon: Icon }: FacilityCardProps) {
  return (
    <article className="rounded-[24px] overflow-hidden shadow-md border bg-white">
      <div className="relative h-[200px]">
        <img src={image} alt={tag} className="absolute inset-0 w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-white/90 text-[#0B2838] text-[11px] px-2 py-1 rounded-full">
          <MapPinned className="inline h-3 w-3 mr-1" />
          {tag}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 text-[#D68631]">
          <Icon className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">{title}</span>
        </div>
        <p className="text-[15px] text-[#0B2838]/85">{body}</p>
      </div>
    </article>
  );
}

interface PartnerCardProps {
  image: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
}
function PartnerCard({ image, title, body, icon: Icon }: PartnerCardProps) {
  return (
    <div className="rounded-[22px] overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative h-[180px]">
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-white">
          <Icon className="h-4 w-4" />
          <span className="font-medium">{title}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[14px] text-[#0B2838]/85">{body}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border px-3 py-2 bg-white">
      <div className="text-[11px] uppercase tracking-wider text-[#0B2838]/60">{label}</div>
      <div className="text-[18px] font-semibold text-[#D68631]">{value}</div>
    </div>
  );
}

function FormField({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <label className="absolute -top-5 left-1 text-[12px] md:text-[13px] text-white">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full md:w-[360px] h-[46px] p-3 border border-white/30 bg-white/95 backdrop-blur-sm rounded-[10px] text-[14px] md:text-[15px] text-[#0B2838] placeholder-[#0B2838]/40 focus:outline-none focus:ring-2 focus:ring-[#D68631]"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-24 bg-[#0B2838] text-white/85">
      <div className="max-w-[1200px] mx-auto px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="grid place-items-center h-9 w-9 rounded-lg bg-[#D68631]">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-semibold text-white">Egress</span>
          </div>
          <p className="text-sm">
            An AI-powered timeline travel platform — built for Sri Lanka, ready for the world.
          </p>
        </div>
        <FooterCol title="Product" items={["Workspace", "Plan a trip", "Alerts", "Bot preview"]} />
        <FooterCol title="Partners" items={["Onboarding", "API access", "Admin console", "Pricing"]} />
        <FooterCol title="Company" items={["About", "Contact", "Privacy", "Terms"]} />
      </div>
      <div className="border-t border-white/10 text-center text-xs py-5">
        © {new Date().getFullYear()} Team_Egress · Built for the AGENTRIX challenge
        <span className="ml-2 inline-flex items-center gap-1">
          <Bell className="h-3 w-3" /> 4 agents online
        </span>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-white font-medium mb-3">{title}</div>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i} className="hover:text-[#D68631] cursor-pointer">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
