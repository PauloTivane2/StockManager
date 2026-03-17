import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - STOK',
  description: 'Acesse a sua conta STOK para gerir o seu estoque.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding / Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-primary/20 to-accent/20">
        {/* Animated background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-info/10 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-foreground w-full">
          {/* Logo area */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20">
              <img src="/estoque.png" alt="STOK" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight">STOK</span>
          </div>

          {/* Center quote */}
          <div className="max-w-md">
            <blockquote className="space-y-4">
              <p className="text-3xl font-semibold leading-tight">
                Gestão de estoque <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  inteligente e eficiente.
                </span>
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Controle total dos seus produtos, movimentações e relatórios em 
                tempo real. Simplifique as suas operações e tome decisões com base em dados.
              </p>
            </blockquote>

            {/* Stats row */}
            <div className="flex gap-8 mt-10">
              <div>
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-xs text-muted-foreground mt-1">Uptime</div>
              </div>
              <div className="w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">{"<"}1s</div>
                <div className="text-xs text-muted-foreground mt-1">Tempo de resposta</div>
              </div>
              <div className="w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">256-bit</div>
                <div className="text-xs text-muted-foreground mt-1">Encriptação</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} STOK — Plataforma de Gestão de Estoque
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[420px]">
          {children}
        </div>

        <p className="mt-8 text-xs text-muted-foreground text-center">
          Ao entrar, você concorda com os{" "}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">Termos de Serviço</span>{" "}
          e{" "}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
}
