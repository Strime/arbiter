type RecordsHandler = (records: MutationRecord[]) => void;

export class MutationObserverHelper {
  private readonly throttleMs: number;

  constructor(throttleMs = 120) {
    this.throttleMs = throttleMs;
  }

  observe(target: Node, handler: RecordsHandler): () => void {
    let pending: MutationRecord[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;

    const flush = (): void => {
      timer = null;
      if (pending.length === 0) return;
      const batch = pending;
      pending = [];
      handler(batch);
    };

    const observer = new MutationObserver((records) => {
      pending.push(...records);
      if (timer === null) {
        timer = setTimeout(flush, this.throttleMs);
      }
    });

    observer.observe(target, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      pending = [];
    };
  }
}
