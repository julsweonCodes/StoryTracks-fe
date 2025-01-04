export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-screen justify-center overflow-hidden bg-blue-300">
      <div className="bg-black-primary text-white-primary h-full w-full max-w-4xl">
        <main className="relative flex h-full w-full flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
