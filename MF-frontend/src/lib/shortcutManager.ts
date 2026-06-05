export interface ShortcutDef {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
  allowInInput?: boolean;
}

type ShortcutLayer = 'system' | 'global' | 'page' | 'component' | 'modal';

const LAYER_PRIORITY: Record<ShortcutLayer, number> = {
  system:    0,
  global:    1,
  page:      2,
  component: 3,
  modal:     4,
};

interface ShortcutScope {
  id: string;
  layer: ShortcutLayer;
  priority: number;
  registeredAt: number;
  // Getter so hooks can swap in fresh closures each render without re-registering
  getShortcuts: () => ShortcutDef[];
  active: boolean;
}

class ShortcutManagerClass {
  private scopes: ShortcutScope[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.dispatch, true);
    }
  }

  private isTextInput(el: HTMLElement): boolean {
    if (el.isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
      const type = (el as HTMLInputElement).type.toLowerCase();
      const nonTextTypes = ['checkbox', 'radio', 'range', 'button', 'submit', 'reset', 'color', 'file'];
      return !nonTextTypes.includes(type);
    }
    return false;
  }

  private dispatch = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;

    // Third-party components can opt out
    if (target.closest('[data-shortcut-ignore]')) return;

    const inputFocused = this.isTextInput(target);

    // When any modal scope is active, layers 1–3 are frozen
    const hasModalActive = this.scopes.some(s => s.layer === 'modal' && s.active);

    // Higher priority = checked first; within same layer, newer registrations win
    const sorted = [...this.scopes]
      .filter(s => s.active)
      .sort((a, b) => b.priority - a.priority || b.registeredAt - a.registeredAt);

    for (const scope of sorted) {
      if (hasModalActive && scope.layer !== 'system' && scope.layer !== 'modal') continue;

      for (const shortcut of scope.getShortcuts()) {
        if (!this.matches(e, shortcut)) continue;

        const hasModifier = shortcut.ctrlKey || shortcut.altKey || shortcut.shiftKey;
        const isEscape = shortcut.key.toLowerCase() === 'escape';

        // Suppress bare-key shortcuts while the user is typing, unless explicitly allowed
        if (inputFocused && !hasModifier && !isEscape && !shortcut.allowInInput) continue;

        e.preventDefault();
        e.stopImmediatePropagation();
        shortcut.action();
        return;
      }
    }
  };

  private matches(e: KeyboardEvent, s: ShortcutDef): boolean {
    if (e.key.toLowerCase() !== s.key.toLowerCase()) return false;
    if (!!s.ctrlKey !== (e.ctrlKey || e.metaKey)) return false;
    if (!!s.altKey !== e.altKey) return false;
    if (!!s.shiftKey !== e.shiftKey) return false;
    return true;
  }

  register(
    id: string,
    layer: ShortcutLayer,
    getShortcuts: () => ShortcutDef[],
    initialActive = true,
  ): { setActive: (v: boolean) => void; unregister: () => void } {
    const scope: ShortcutScope = {
      id,
      layer,
      priority: LAYER_PRIORITY[layer],
      registeredAt: Date.now(),
      getShortcuts,
      active: initialActive,
    };
    this.scopes.push(scope);

    return {
      setActive: (v) => { scope.active = v; },
      unregister: () => { this.scopes = this.scopes.filter(s => s !== scope); },
    };
  }
}

export const ShortcutManager = new ShortcutManagerClass();
