import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  Sparkles, Search, Target, Bell, BarChart3, Compass,
  GraduationCap, Award, Zap, TrendingUp, BookOpen, Briefcase,
  Code, Cpu, FileText, Map, Bookmark, Clock, Layers,
  MessageCircle, Star, ChevronRight, Menu, X,
  CheckCircle2, ArrowRight, Users, Building2, Sun, Moon,
} from "lucide-react";

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); o.unobserve(el); } },
      { threshold }
    );
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimatedSection({ children, className = "", threshold }: { children: React.ReactNode; className?: string; threshold?: number }) {
  const { ref, visible } = useScrollReveal(threshold);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

/* ─── Data ─── */
const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

const problems = [
  { icon: Search, title: "Scattered Searches", desc: "Manually browsing dozens of sites for opportunities" },
  { icon: Bell, title: "Missed Deadlines", desc: "Losing track of application due dates and requirements" },
  { icon: Target, title: "No Personalization", desc: "Generic recommendations that don't match your skills" },
  { icon: BarChart3, title: "No Tracking", desc: "No centralized way to track your applications" },
  { icon: Code, title: "Unknown Skills", desc: "Not knowing what skills you need for your dream role" },
  { icon: Compass, title: "Lack of Guidance", desc: "No clear career roadmap or mentor-like advice" },
];

const services = [
  { icon: Briefcase, title: "Internship Finder", desc: "Discover internships tailored to your field of study.", gradient: "from-blue-500 to-cyan-500" },
  { icon: GraduationCap, title: "Scholarship Finder", desc: "Find scholarships matching your academic profile.", gradient: "from-emerald-500 to-teal-500" },
  { icon: Zap, title: "Hackathon Discovery", desc: "Stay updated on upcoming hackathons and competitions.", gradient: "from-purple-500 to-pink-500" },
  { icon: Award, title: "Competition Explorer", desc: "Case competitions, olympiads, and challenges.", gradient: "from-amber-500 to-orange-500" },
  { icon: Star, title: "Fellowship Programs", desc: "Find prestigious fellowships and leadership programs.", gradient: "from-rose-500 to-red-500" },
  { icon: Building2, title: "Job Opportunities", desc: "Get matched with jobs that fit your goals.", gradient: "from-indigo-500 to-violet-500" },
  { icon: BookOpen, title: "Bootcamp Discovery", desc: "Explore coding bootcamps and intensive programs.", gradient: "from-sky-500 to-blue-500" },
  { icon: Cpu, title: "AI Career Guidance", desc: "Personalized career advice powered by AI.", gradient: "from-fuchsia-500 to-purple-500" },
];

const features = [
  { icon: Sparkles, title: "AI Smart Search", desc: "Intelligent search that understands your skills." },
  { icon: Cpu, title: "AI Recommendations", desc: "Personalized opportunities recommended by ML." },
  { icon: Target, title: "Match Score", desc: "See how well each opportunity aligns with you." },
  { icon: BarChart3, title: "Skill Gap Analysis", desc: "Identify missing skills and learn them." },
  { icon: FileText, title: "Resume Analysis", desc: "Get AI-powered feedback on your resume." },
  { icon: Map, title: "Career Roadmap", desc: "Visual roadmap showing your career path." },
  { icon: Bookmark, title: "Saved Opportunities", desc: "Bookmark and revisit anytime." },
  { icon: Clock, title: "Deadline Reminders", desc: "Never miss a deadline with smart alerts." },
  { icon: Layers, title: "Application Tracker", desc: "Track every application stage in one place." },
  { icon: MessageCircle, title: "AI Career Coach", desc: "Chat with an AI coach for instant guidance." },
];

const steps = [
  { num: "01", title: "Create Your Profile", desc: "Tell us about your education, skills, and goals in minutes.", icon: FileText },
  { num: "02", title: "AI Analyzes Your Profile", desc: "Our AI processes your profile to understand your strengths.", icon: Cpu },
  { num: "03", title: "Get Personalized Matches", desc: "Receive curated opportunities ranked by fit.", icon: Sparkles },
  { num: "04", title: "Apply & Track Progress", desc: "Apply directly and track everything in one dashboard.", icon: TrendingUp },
];

const faqs = [
  { q: "What is AI Opportunity Navigator?", a: "An intelligent career platform that helps students discover personalized opportunities using AI-powered matching." },
  { q: "Is it free to use?", a: "Yes! Completely free for students and job seekers. Create your profile and start receiving recommendations." },
  { q: "How does AI matching work?", a: "Our AI analyzes your profile — education, skills, interests — and compares against thousands of opportunities to find the best matches." },
  { q: "What opportunities can I find?", a: "Internships, scholarships, hackathons, competitions, fellowships, jobs, and bootcamps — all in one place." },
  { q: "How do I track applications?", a: "Your dashboard gives a complete view of all applications, statuses, upcoming deadlines, and next steps." },
  { q: "Can I update my profile later?", a: "Absolutely! Update anytime and the AI will re-evaluate your recommendations." },
];

const testimonials = [
  { name: "Sarah Chen", role: "CS Student", avatar: "SC", quote: "I found my dream internship through OppNav. The match scores made it so easy to know which opportunities were worth my time.", rating: 5 },
  { name: "Marcus Johnson", role: "Recent Graduate", avatar: "MJ", quote: "The skill gap analysis was a game-changer. I knew exactly what to learn. Landed a role in 3 months.", rating: 5 },
  { name: "Priya Patel", role: "UX Design Student", avatar: "PP", quote: "I was missing deadlines everywhere. Now I get reminders and track everything from one dashboard.", rating: 5 },
];

const dashboardItems = [
  { title: "Google STEP Intern", tag: "Internship", score: "98", color: "bg-emerald-500" },
  { title: "MITACS Globalink", tag: "Fellowship", score: "92", color: "bg-blue-500" },
  { title: "HackMIT 2025", tag: "Hackathon", score: "87", color: "bg-purple-500" },
];

/* ─── Component ─── */
export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [stars, setStars] = useState<{ x: number; y: number; s: number }[]>([]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    setStars(Array.from({ length: 30 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100, s: Math.random() * 2 + 1,
    })));
  }, []);

  const st = (h: string) => {
    setMobileOpen(false);
    document.querySelector(h)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
      {/* Floating particles */}
      {stars.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {stars.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-primary/20 animate-pulse"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`,
                animationDelay: `${i * 0.3}s`, animationDuration: `${2 + s.s * 1.5}s` }}
            />
          ))}
        </div>
      )}

      {/* ─── NAV ─── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-surface/80 backdrop-blur-xl border-b border-border/50 shadow-sm" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground hidden sm:block">
                Opp<span className="text-primary">Nav</span>
              </span>
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(l => (
                <button key={l.href} onClick={() => st(l.href)}
                  className="px-3.5 py-2 text-sm text-foreground/70 hover:text-foreground rounded-lg hover:bg-foreground/5 transition-all cursor-pointer font-medium"
                >{l.label}</button>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-foreground/5 transition-all cursor-pointer text-foreground/60 hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => navigate("/login")}
                className="px-5 py-2.5 text-sm font-semibold text-foreground/80 hover:text-foreground rounded-xl hover:bg-foreground/5 transition-all cursor-pointer"
              >Login</button>
              <button onClick={() => navigate("/login")}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97] transition-all cursor-pointer"
              >Get Started</button>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-foreground/5 transition-colors cursor-pointer" aria-label="Toggle menu"
            >{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t border-border/50 bg-surface/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(l => (
                <button key={l.href} onClick={() => st(l.href)}
                  className="block w-full text-left px-4 py-3 text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-all cursor-pointer font-medium"
                >{l.label}</button>
              ))}
              <div className="pt-3 space-y-2">
                <button onClick={() => { setMobileOpen(false); navigate("/login"); }}
                  className="w-full px-4 py-3 text-sm font-semibold text-center text-foreground/80 rounded-xl border border-border hover:bg-foreground/5 transition-all cursor-pointer"
                >Login</button>
                <button onClick={() => { setMobileOpen(false); navigate("/login"); }}
                  className="w-full px-4 py-3 text-sm font-semibold text-center text-white bg-gradient-to-r from-primary to-secondary rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >Get Started</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section id="hero" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <AnimatedSection>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" /> Your AI Career Copilot
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mt-4">
                  Find Your Next{" "}
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Opportunity</span>{" "}
                  with AI
                </h1>
              </AnimatedSection>
              <AnimatedSection>
                <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Discover internships, scholarships, hackathons, fellowships, competitions, jobs,
                  and bootcamps personalized for your skills and career goals.
                </p>
              </AnimatedSection>
              <AnimatedSection>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <button onClick={() => navigate("/login")}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97] transition-all cursor-pointer text-base"
                  >Get Started Free <ArrowRight className="inline-block ml-2 w-4 h-4" /></button>
                  <button
                    className="w-full sm:w-auto px-8 py-3.5 text-foreground/70 font-semibold rounded-xl border border-border hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5 active:scale-[0.97] transition-all cursor-pointer text-base flex items-center justify-center gap-2"
                  >{/* Using Play icon inline since lucide-react removed it */}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                    Watch Demo
                  </button>
                </div>
              </AnimatedSection>
              <AnimatedSection>
                <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                  <div className="flex -space-x-2">
                    {["SC", "MJ", "PP", "AK"].map((init, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-[10px] font-bold flex items-center justify-center border-2 border-background">{init}</div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-accent text-accent" />))}</div>
                    <span className="text-foreground/50">Trusted by 2,000+ students</span>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Right: Dashboard Mockup */}
            <AnimatedSection>
              <div className="relative">
                <div className="relative bg-white rounded-2xl border border-border shadow-2xl shadow-primary/10 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs text-foreground/40 font-medium ml-2">dashboard.oppnav.ai</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Match Score</span>
                        </div>
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-bold text-primary font-heading">94</span>
                          <span className="text-sm text-foreground/40 mb-1">/100</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                          <div className="h-full w-[94%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className="w-4 h-4 text-accent" />
                          <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">AI Insight</span>
                        </div>
                        <p className="text-sm text-foreground/70 leading-snug">
                          Your skills match <strong className="text-accent">Data Science</strong> internships. Consider adding Python libraries.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Recommended Opportunities</span>
                      </div>
                      {dashboardItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-border hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.title}</p>
                              <span className="text-[11px] text-foreground/40">{item.tag}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-primary">{item.score}%</span>
                            <ChevronRight className="w-3.5 h-3.5 text-foreground/30" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">AI Powered</div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 bg-destructive/10 text-destructive text-sm font-medium rounded-full mb-4">The Challenge</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Tired of <span className="text-destructive">Searching Everywhere?</span>
            </h2>
            <p className="mt-4 text-lg text-foreground/60">
              Students spend hours browsing multiple platforms, yet still miss the best opportunities.
            </p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <AnimatedSection key={i} threshold={0.1}>
                  <div className="group relative bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{p.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-muted/30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedSection>
              <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-sm font-medium rounded-full mb-4">The Solution</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                One Platform.<br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Infinite Possibilities.</span>
              </h2>
              <p className="mt-4 text-lg text-foreground/60 leading-relaxed">
                AI Opportunity Navigator brings everything together in one intelligent platform. No more juggling tabs, spreadsheets, and bookmarks.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Cpu, title: "AI-Powered Matching", desc: "Our AI analyzes your unique profile and finds opportunities that truly fit." },
                  { icon: Search, title: "Smart Search Across All Platforms", desc: "One search covers internships, scholarships, hackathons, jobs, and more." },
                  { icon: Compass, title: "Personalized Career Guidance", desc: "Get mentor-like advice, skill recommendations, and a clear roadmap." },
                  { icon: Layers, title: "Centralized Application Tracking", desc: "Track every application, deadline, and status from one dashboard." },
                ].map((sol, i) => {
                  const Icon2 = sol.icon;
                  return (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon2 className="w-5.5 h-5.5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-foreground">{sol.title}</h4>
                        <p className="text-sm text-foreground/60 mt-0.5">{sol.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-8 border border-border">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Hours Saved", value: "15+", color: "text-primary" },
                      { label: "Match Accuracy", value: "94%", color: "text-secondary" },
                      { label: "Opportunities", value: "10K+", color: "text-accent" },
                      { label: "Happy Users", value: "2K+", color: "text-emerald-500" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 border border-border text-center hover:shadow-md transition-shadow">
                        <p className={`text-3xl font-bold font-heading ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-foreground/50 mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-5 bg-white rounded-2xl border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground/60">What users say</span>
                    </div>
                    <p className="text-sm text-foreground/70 italic leading-relaxed">
                      &ldquo;This platform changed how I find opportunities. The AI recommendations are surprisingly accurate.&rdquo;
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">AK</div>
                      <span className="text-xs text-foreground/50">Alex Kim, Stanford University</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="relative py-20 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">Our Services</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="mt-4 text-lg text-foreground/60">
              From internships to career guidance, we&apos;ve got every opportunity type covered.
            </p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <AnimatedSection key={i} threshold={0.1}>
                  <div className="group bg-white rounded-2xl border border-border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{s.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
      {/* ─── FEATURES ─── */}
      <section id="features" className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">Features</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Built for{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Success</span>
            </h2>
            <p className="mt-4 text-lg text-foreground/60">
              Powerful tools to help you discover, track, and land the perfect opportunity.
            </p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <AnimatedSection key={i} threshold={0.05}>
                  <div className="group bg-white rounded-2xl border border-border p-5 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-default text-center">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                    <p className="text-xs text-foreground/60 leading-relaxed">{f.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="relative py-20 md:py-28 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary text-sm font-medium rounded-full mb-4">How It Works</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              From Profile to{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Opportunity</span>{" "}
              in 4 Steps
            </h2>
            <p className="mt-4 text-lg text-foreground/60">
              Getting started takes just a few minutes.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <AnimatedSection key={i} threshold={0.1}>
                  <div className="relative bg-white rounded-2xl border border-border p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                      {step.num}
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-foreground/60 leading-relaxed">{step.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-sm font-medium rounded-full mb-4">Testimonials</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Loved by{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Students</span>
            </h2>
            <p className="mt-4 text-lg text-foreground/60">
              Hear from people who found their path with OppNav.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} threshold={0.1}>
                <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed mb-4 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold flex items-center justify-center">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-foreground/50">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="relative py-20 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedSection>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">About Us</span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Empowering Students to{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Find Their Path</span>
              </h2>
              <p className="mt-4 text-lg text-foreground/60 leading-relaxed">
                At AI Opportunity Navigator, we believe every student deserves access to the best opportunities.
                Our AI-powered platform eliminates the noise and delivers personalized recommendations that
                match your unique skills, interests, and career goals.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { stat: "10K+", label: "Opportunities Listed" },
                  { stat: "2K+", label: "Active Students" },
                  { stat: "94%", label: "Satisfaction Rate" },
                  { stat: "50+", label: "Partner Organizations" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-background/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <span className="font-heading font-bold text-primary">{item.stat}</span>
                    </div>
                    <span className="text-foreground/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="relative">
                <div className="bg-white rounded-3xl border border-border p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-lg text-foreground">OppNav</p>
                      <p className="text-sm text-foreground/50">AI Opportunity Navigator</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/70">Completely free for all students</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/70">AI-powered matching saves hours of manual searching</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/70">Track every application in one centralized dashboard</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/70">Get personalized skill recommendations to improve</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/70">Deadline reminders so you never miss an opportunity</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
                    <p className="text-sm text-foreground/70 italic">
                      &ldquo;Your career journey starts with the right opportunity. Let AI guide you.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="relative py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">FAQ</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Got Questions?{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">We&apos;ve Got Answers</span>
            </h2>
          </AnimatedSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} threshold={0.05}>
                <div className="bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                    aria-expanded={activeFaq === i}
                  >
                    <span className="font-medium text-foreground pr-4">{faq.q}</span>
                    <ChevronRight className={`w-5 h-5 text-foreground/40 shrink-0 transition-transform duration-300 ${activeFaq === i ? "rotate-90" : ""}`} />
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${activeFaq === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="px-6 pb-4 text-sm text-foreground/60 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/50 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> Get Started Today
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-foreground leading-tight">
              Ready to Find Your{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Next Opportunity</span>?
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto">
              Join thousands of students who are already discovering personalized opportunities with AI.
              It&apos;s free, and it takes less than 2 minutes to get started.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
              <button onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97] transition-all cursor-pointer text-lg"
              >Get Started Free <ArrowRight className="inline-block ml-2 w-5 h-5" /></button>
              <button onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-10 py-4 text-foreground/70 font-semibold rounded-xl border border-border hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5 active:scale-[0.97] transition-all cursor-pointer text-lg"
              >Learn More</button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-950 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-white">
                  Opp<span className="text-primary">Nav</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                AI Opportunity Navigator helps students discover internships, scholarships, hackathons,
                fellowships, competitions, jobs, and bootcamps — all personalized by AI.
              </p>
              <div className="flex items-center gap-4 mt-6">
                {[Star, MessageCircle, Search, Bell].map((Icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm text-gray-400 mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                {["Home", "Features", "Services", "How It Works", "FAQ"].map((link) => (
                  <li key={link}>
                    <button onClick={() => st(`#${link.toLowerCase().replace(/\s+/g, "-")}`)}
                      className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer"
                    >{link}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm text-gray-400 mb-4">Get Started</h3>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">Sign Up</button>
                </li>
                <li>
                  <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">Login</button>
                </li>
                <li>
                  <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">Dashboard</button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} AI Opportunity Navigator. Built for students, by dreamers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );}