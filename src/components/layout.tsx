export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-screen justify-center overflow-hidden bg-black-primary">
      <div className="h-full w-full max-w-4xl bg-black-primary text-white-primary">
        <main className="relative flex h-full w-full flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
