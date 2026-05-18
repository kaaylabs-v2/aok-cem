import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import loginHero from "@/assets/login-hero.jpg";

function InteractiveHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setT({
      rx: (0.5 - y) * 10,
      ry: (x - 0.5) * 14,
      mx: x * 100,
      my: y * 100,
      active: true,
    });
  };

  const handleLeave = () => setT({ rx: 0, ry: 0, mx: 50, my: 50, active: false });

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group relative hidden overflow-hidden lg:block"
      style={{ perspective: "1200px" }}
    >
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
        {/* cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: t.active ? 1 : 0,
            background: `radial-gradient(420px circle at ${t.mx}% ${t.my}%, hsla(0,0%,100%,0.28), transparent 60%)`,
            mixBlendMode: "screen",
          }}
        />
        {/* color shimmer */}
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

      {/* floating text on top layer */}
      <div
        className="pointer-events-none absolute bottom-10 left-10 right-10 text-white transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${(t.mx - 50) * 0.15}px, ${(t.my - 50) * 0.15}px, 0)`,
        }}
      >
        <h2 className="text-4xl font-bold leading-tight tracking-tight drop-shadow-lg md:text-5xl">
          DISCOVER.<br />BOOK.<br />EXPERIENCE.
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/85">
          Manage every enquiry, approval and booking for the events that matter most.
        </p>
      </div>
    </div>
  );
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
    toast({ title: "Welcome back", description: "Signed in successfully." });
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-bg p-3 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1400px] grid-cols-1 overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 shadow-panel backdrop-blur-xl lg:grid-cols-2">
        {/* Left visual */}
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
                onClick={() => toast({ title: "Google Sign-in", description: "Connect Lovable Cloud to enable." })}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6.1S8.7 5.9 12 5.9c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
                </svg>
                Sign in with Google
              </Button>
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
