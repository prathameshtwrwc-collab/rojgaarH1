import { Component, type ErrorInfo, type ReactNode } from 'react';

// A crash anywhere below this shows a friendly screen instead of a blank white page.
// A missing code file right after a deploy is handled by reloading once (see main.tsx).

const isChunkError = (err: unknown) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    String((err as { message?: string })?.message || err),
  );

interface State { error: unknown }

export default class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
    // New version deployed while the tab was open: fetch it, but only once per session
    if (isChunkError(error)) {
      try {
        if (sessionStorage.getItem('rh.chunkReload') !== '1') {
          sessionStorage.setItem('rh.chunkReload', '1');
          window.location.reload();
        }
      } catch { /* storage blocked */ }
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    const update = isChunkError(this.state.error);
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg-warm)] px-6" role="alert">
        <div className="max-w-sm w-full text-center" style={{ animation: 'ap-rise 480ms var(--ease-out-expo) both' }}>
          <img src="/assets/logo/RogjaarHaiLogo.png" alt="Rojgaar Hai" className="h-14 w-auto mx-auto mb-6 object-contain" />
          <h1 className="text-2xl font-extrabold text-[var(--navy)]" style={{ fontFamily: 'var(--font-display)' }}>
            {update ? 'A new version is ready' : 'Something went wrong'}
          </h1>
          <p className="mt-2 text-sm text-[var(--charcoal)]">
            {update
              ? 'We just updated Rojgaar Hai. Reload to get the latest version.'
              : 'This screen could not load. Reloading usually fixes it. Your data is safe.'}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-12 rounded-full bg-[var(--orange)] text-white font-bold active:scale-[0.98] transition-transform"
            >
              Reload
            </button>
            <a href="/" className="h-12 rounded-full border border-slate-300 text-[var(--navy)] font-bold flex items-center justify-center bg-white">
              Go to home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
