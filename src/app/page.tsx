import ToolGrid from '@/components/tool-grid';

function Header() {
  return (
    <header className="text-center mb-12">
      <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight font-headline">
        مصاحب
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold text-primary mt-2 font-headline">
        مساعدك التربوي الذكي
      </h2>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
        أدوات ذكية بين يديك لتسهيل مهامك التربوية اليومية.
      </p>
    </header>
  );
}

function Footer() {
  return (
    <footer className="text-center mt-16 pt-8 border-t">
      <p className="text-muted-foreground font-semibold">Debex &copy; 2025</p>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
      <Header />
      <main>
        <ToolGrid />
      </main>
      <Footer />
    </div>
  );
}
