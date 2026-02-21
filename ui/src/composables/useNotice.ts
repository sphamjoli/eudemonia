import { ref } from 'vue';

/** View-level notice kind for inline feedback banners. */
export type NoticeKind = 'ok' | 'fail';

/** Shared notice state for success and error messages across role pages. */
export function useNotice() {
  const message = ref('');
  const messageKind = ref<NoticeKind>('ok');

  /** Clears current notice text. */
  function clearNotice(): void {
    message.value = '';
  }

  /** Sets a notice with explicit kind and message text. */
  function setNotice(kind: NoticeKind, text: string): void {
    messageKind.value = kind;
    message.value = text;
  }

  /** Sets a failure notice from any thrown value. */
  function setFailure(cause: unknown, fallback = 'Operation failed.'): string {
    const text = cause instanceof Error ? cause.message : String(cause);
    const normalized = text || fallback;
    setNotice('fail', normalized);
    return normalized;
  }

  return {
    message,
    messageKind,
    clearNotice,
    setNotice,
    setFailure,
  };
}
