export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen justify-center bg-blue-300">
      <div className="h-full w-full max-w-4xl bg-yellow-300">
        <main className="relative flex h-full w-full flex-col">{children}</main>
        <footer></footer>
      </div>
    </div>
  );
}
