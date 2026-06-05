import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ShortcutManager, type ShortcutDef } from '../lib/shortcutManager';

export type { ShortcutDef };

/**
 * Layer 1 — global shortcuts active across all admin pages.
 * Blocked when an input is focused or a modal scope is active.
 * Call once in AdminLayout.
 */
export function useGlobalShortcuts(shortcuts: ShortcutDef[]): void {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;
  useEffect(() => {
    const { unregister } = ShortcutManager.register('global', 'global', () => ref.current);
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Layer 2 — page-level shortcuts. Register once per mounted page component.
 * Blocked when an input is focused or a modal scope is active.
 */
export function usePageShortcuts(pageId: string, shortcuts: ShortcutDef[]): void {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;
  useEffect(() => {
    const { unregister } = ShortcutManager.register(`page:${pageId}`, 'page', () => ref.current);
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Layer 3 — component-scoped shortcuts. Active only while `containerRef` has focus.
 * Pass a ref to the focusable container (tabIndex={0}).
 */
export function useComponentShortcuts(
  componentId: string,
  shortcuts: ShortcutDef[],
  containerRef: React.RefObject<HTMLElement>,
): void {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;
  useEffect(() => {
    const { setActive, unregister } = ShortcutManager.register(
      `component:${componentId}`,
      'component',
      () => ref.current,
      false, // starts inactive until container is focused
    );

    const el = containerRef.current;
    if (!el) return unregister;

    const onFocusIn  = () => setActive(true);
    const onFocusOut = (e: FocusEvent) => {
      // Only deactivate if focus truly left the container
      if (!el.contains(e.relatedTarget as Node)) setActive(false);
    };

    el.addEventListener('focusin',  onFocusIn);
    el.addEventListener('focusout', onFocusOut);
    return () => {
      el.removeEventListener('focusin',  onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
      unregister();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Layer 4 — modal shortcuts. While this scope is mounted, all global/page/component
 * shortcuts are frozen. Only system and modal shortcuts fire.
 * Mount this inside the modal JSX so it's registered ↔ unmounted with the dialog.
 */
export function useModalShortcuts(modalId: string, shortcuts: ShortcutDef[]): void {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;
  useEffect(() => {
    const { unregister } = ShortcutManager.register(`modal:${modalId}`, 'modal', () => ref.current);
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Convenience component — render inside modal JSX to register modal shortcuts.
 * Automatically unregisters when the parent modal unmounts.
 *
 * Usage:
 *   {open && (
 *     <>
 *       <ModalShortcutsMount modalId="deposit" shortcuts={[...]} />
 *       <div>...dialog content...</div>
 *     </>
 *   )}
 */
export function ModalShortcutsMount({
  modalId,
  shortcuts,
}: {
  modalId: string;
  shortcuts: ShortcutDef[];
}): null {
  useModalShortcuts(modalId, shortcuts);
  return null;
}

/**
 * After every route change, move focus to the page wrapper so keyboard
 * navigation starts from the correct place.
 * Call once in AdminLayout.
 */
export function useFocusOnNavigate(): void {
  const location = useLocation();
  useEffect(() => {
    requestAnimationFrame(() => {
      const main = document.querySelector('[data-focus-target="page"]') as HTMLElement | null;
      main?.focus({ preventScroll: true });
    });
  }, [location.pathname]);
}
