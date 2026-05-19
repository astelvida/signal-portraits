// Placeholder landing page. Replaced in Task 7 with the wireframe §01 layout.
export default function Home() {
  return (
    <main className="px-8 py-16 max-w-[1280px] mx-auto">
      <p className="mono text-xs uppercase tracking-wider text-[var(--color-mute)]">
        Scaffold OK · Task 3 complete
      </p>
      <h1 className="display text-5xl mt-6">
        Signal Portraits<span style={{ color: "var(--color-accent)" }}>.</span>
      </h1>
      <p className="mt-4 max-w-[48ch]">
        Scaffold renders. Fonts mount. Brand tokens live in <code className="mono">app/globals.css</code>.
      </p>
    </main>
  );
}
