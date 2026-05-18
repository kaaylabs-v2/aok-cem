import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Eye, EyeOff, Calendar, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import loginHero from "@/assets/login-hero.jpg";

/* ---------- Particles canvas with cursor repulsion ---------- */
function ParticleField({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number; active: boolean }> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const N = 70;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.4,
      r: 0.8 + Math.random() * 2.2,
      a: 0.3 + Math.random() * 0.6,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const m = mouse.current;
      for (const p of particles) {
        // cursor repulsion
        if (m.active) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            const d = Math.sqrt(d2) || 1;
            const f = (110 - d) / 110;
            p.vx += (dx / d) * f * 0.6;
            p.vy += (dy / d) * f * 0.6;
          }
        }
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 - 0.01;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -0.2 - Math.random() * 0.4;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${p.a})`;
        ctx.shadowColor = "rgba(255,210,140,0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mouse]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}

/* ---------- Floating ticket / chip cards ---------- */
const FLOATERS = [
  { icon: Ticket, label: "VIP", depth: 0.35, top: "18%", left: "12%", tint: "from-fuchsia-500/80 to-rose-500/80" },
  { icon: Calendar, label: "May 24", depth: 0.55, top: "30%", left: "70%", tint: "from-sky-500/80 to-indigo-500/80" },
  { icon: MapPin, label: "Wembley", depth: 0.25, top: "62%", left: "15%", tint: "from-emerald-500/80 to-teal-500/80" },
  { icon: Sparkles, label: "Sold out", depth: 0.45, top: "55%", left: "68%", tint: "from-amber-400/80 to-orange-500/80" },
];

/* ---------- Ripples on click ---------- */
type Ripple = { id: number; x: number; y: number };

function InteractiveHero() {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0, active: false });
  const [t, setT] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    mouse.current = { x, y, active: true };
    const nx = x / r.width;
    const ny = y / r.height;
    setT({
      rx: (0.5 - ny) * 8,
      ry: (nx - 0.5) * 12,
      mx: nx * 100,
      my: ny * 100,
      active: true,
    });
  };

  const handleLeave = () => {
    mouse.current = { ...mouse.current, active: false };
    setT({ rx: 0, ry: 0, mx: 50, my: 50, active: false });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const ripple = { id, x: e.clientX - r.left, y: e.clientY - r.top };
    setRipples((rs) => [...rs, ripple]);
    setTimeout(() => setRipples((rs) => rs.filter((p) => p.id !== id)), 900);
  };

  return (
    <div className="relative hidden p-[2px] lg:block">
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 -z-0 opacity-90"
        style={{
          background:
            "conic-gradient(from var(--angle, 0deg), hsl(280 90% 65%), hsl(210 90% 60%), hsl(330 90% 65%), hsl(45 95% 60%), hsl(280 90% 65%))",
          animation: "heroBorderSpin 8s linear infinite",
          filter: "blur(2px)",
        }}
      />
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        className="relative h-full w-full overflow-hidden rounded-[1.85rem] cursor-crosshair"
        style={{ perspective: "1200px" }}
      >
        {/* Tilted image layer */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.active ? 1.06 : 1})`,
            transformStyle: "preserve-3d",
          }}
        >
          <img
            src={loginHero}
            alt="Live event stage with crowd and tickets"
            className="absolute inset-0 h-full w-full object-cover"
            width={1024}
            height={1280}
          />

          {/* Sweeping light beams */}
          <div
            className="pointer-events-none absolute -inset-1/2"
            style={{
              background:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
              animation: "heroBeam 6s ease-in-out infinite",
              mixBlendMode: "screen",
            }}
          />
          <div
            className="pointer-events-none absolute -inset-1/2"
            style={{
              background:
                "linear-gradient(115deg, transparent 45%, rgba(255,210,140,0.18) 50%, transparent 55%)",
              animation: "heroBeam 9s ease-in-out infinite 1.5s",
              mixBlendMode: "screen",
            }}
          />

          {/* Cursor spotlight */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: t.active ? 1 : 0,
              background: `radial-gradient(420px circle at ${t.mx}% ${t.my}%, hsla(0,0%,100%,0.28), transparent 60%)`,
              mixBlendMode: "screen",
            }}
          />
          {/* Color shimmer */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: t.active ? 0.55 : 0,
              background: `radial-gradient(600px circle at ${t.mx}% ${t.my}%, hsla(280,90%,65%,0.35), hsla(210,90%,60%,0.15) 40%, transparent 70%)`,
              mixBlendMode: "overlay",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        </div>

        {/* Particles */}
        <ParticleField mouse={mouse} />

        {/* Floating chips with depth-based parallax */}
        {FLOATERS.map((f, i) => {
          const Icon = f.icon;
          const offX = (t.mx - 50) * f.depth;
          const offY = (t.my - 50) * f.depth;
          return (
            <div
              key={i}
              className="pointer-events-none absolute transition-transform duration-300 ease-out"
              style={{
                top: f.top,
                left: f.left,
                transform: `translate3d(${offX}px, ${offY + Math.sin((Date.now() / 1000 + i) * 0.001) * 4}px, 0)`,
                animation: `floatY ${4 + i}s ease-in-out ${i * 0.4}s infinite alternate`,
              }}
            >
              <div
                className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${f.tint} px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm`}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
              </div>
            </div>
          );
        })}

        {/* Ripples */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: r.x - 4,
              top: r.y - 4,
              width: 8,
              height: 8,
              border: "2px solid rgba(255,255,255,0.85)",
              animation: "heroRipple 0.9s ease-out forwards",
            }}
          />
        ))}

        {/* Headline with parallax */}
        <div
          className="pointer-events-none absolute bottom-20 left-10 right-10 text-white transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${(t.mx - 50) * 0.18}px, ${(t.my - 50) * 0.18}px, 0)`,
          }}
        >
          <h2 className="text-4xl font-bold leading-tight tracking-tight drop-shadow-lg md:text-5xl">
            DISCOVER.<br />BOOK.<br />EXPERIENCE.
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/85">
            Manage every enquiry, approval and booking for the events that matter most.
          </p>
        </div>

        {/* Live stats marquee */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/15 bg-black/40 py-2 backdrop-blur-md">
          <div className="flex w-max gap-10 whitespace-nowrap text-xs font-medium text-white/80" style={{ animation: "marquee 28s linear infinite" }}>
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex gap-10">
                <span>★ 12,438 events booked this month</span>
                <span>● 98% approval rate</span>
                <span>♪ 47 live concerts tonight</span>
                <span>⚽ 12 fixtures this weekend</span>
                <span>✦ 320 venues onboarded</span>
                <span>◆ £4.2M in bookings cleared</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes heroBorderSpin { to { --angle: 360deg; } }
        @keyframes heroBeam {
          0% { transform: translateX(-30%) rotate(0deg); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateX(30%) rotate(0deg); opacity: 0; }
        }
        @keyframes heroRipple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(28); opacity: 0; }
        }
        @keyframes floatY {
          from { translate: 0 -6px; }
          to { translate: 0 6px; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ---------- Magnetic button ---------- */
function MagneticButton({
  children,
  onClick,
  type = "button",
  variant,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "default" | "outline";
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [tx, setTx] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    setTx({ x: x * 0.25, y: y * 0.4 });
  };
  const reset = () => setTx({ x: 0, y: 0 });

  return (
    <div
      ref={wrap}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="relative"
    >
      <Button
        type={type}
        variant={variant}
        onClick={onClick}
        className={`h-11 w-full rounded-lg transition-transform duration-200 ease-out ${className}`}
        style={{ transform: `translate(${tx.x}px, ${tx.y}px)` }}
      >
        {children}
      </Button>
    </div>
  );
}

/* ---------- Audio click ---------- */
function playClick() {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 300);
  } catch {
    /* no-op */
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing details", description: "Enter your email and password." });
      return;
    }
    playClick();
    toast({ title: "Welcome back", description: "Signed in successfully." });
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-bg p-3 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1400px] grid-cols-1 overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 shadow-panel backdrop-blur-xl lg:grid-cols-2">
        <InteractiveHero />

        {/* Right form */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-16">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Ticket className="h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-semibold tracking-widest text-muted-foreground">
                EVENTHUB
              </span>
            </div>

            <h1 className="text-center text-3xl font-bold tracking-tight">WELCOME BACK</h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sign in to manage your bookings and enquiries
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={remember}
                    onCheckedChange={(v) => setRemember(Boolean(v))}
                  />
                  Remember me
                </label>
                <Link to="#" className="text-sm font-medium text-foreground hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="h-11 w-full rounded-lg">
                Sign In
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-lg"
                onClick={() => {
                  playClick();
                  toast({ title: "Google Sign-in", description: "Connect Lovable Cloud to enable." });
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6.1S8.7 5.9 12 5.9c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
                </svg>
                Sign in with Google
              </MagneticButton>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="#" className="font-semibold text-foreground hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
