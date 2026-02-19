import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { vi } from 'vitest';
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jasmine {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<T> {
      toHaveBeenCalled(): boolean;
      toHaveBeenCalledWith(...args: unknown[]): boolean;
      toHaveBeenCalledTimes(expected: number): boolean;
    }
  }
  const jasmine: {
    createSpy: typeof vi.fn;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createSpyObj: (baseName: string, methodNames: string[]) => any;
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jasmine = {
  createSpy: () => vi.fn(),
  createSpyObj: (baseName: string, methodNames: string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = {};
    methodNames.forEach(method => {
      obj[method] = vi.fn();
    });
    return obj;
  },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).spyOn = vi.spyOn;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).VITEST_ENVIRONMENT = true;
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      return undefined;
    },
    removeListener: () => {
      return undefined;
    },
    addEventListener: () => {
      return undefined;
    },
    removeEventListener: () => {
      return undefined;
    },
    dispatchEvent: () => true,
  }),
});
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).plausible = vi.fn();
const originalCreateElement = document.createElement.bind(document);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
document.createElement = function (tagName: string, options?: any) {
  const element = originalCreateElement(tagName, options);
  if (!element.getRootNode) {
    element.getRootNode = () => document;
  }

  return element;
};
if (!document.body) {
  document.body = document.createElement('body');
}
if (!window.getSelection) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).getSelection = () => ({
    removeAllRanges: () => {
      return undefined;
    },
    addRange: () => {
      return undefined;
    },
    getRangeAt: () => ({
      cloneRange: () => ({}),
      getClientRects: () => [],
      getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    }),
    rangeCount: 0,
    type: 'None',
    anchorNode: null,
    focusNode: null,
  });
}
if (!window.DOMRect) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).DOMRect = class DOMRect {
    constructor(
      public x = 0,
      public y = 0,
      public width = 0,
      public height = 0,
    ) {
      this.top = y;
      this.left = x;
      this.right = x + width;
      this.bottom = y + height;
    }
    top = 0;
    left = 0;
    right = 0;
    bottom = 0;

    toJSON() {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        top: this.top,
        left: this.left,
        right: this.right,
        bottom: this.bottom,
      };
    }
  };
}
if (!document.createRange) {
  document.createRange = () =>
    ({
      setStart: () => {
        return undefined;
      },
      setEnd: () => {
        return undefined;
      },
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      startContainer: document.body,
      endContainer: document.body,
      startOffset: 0,
      endOffset: 0,
      collapsed: false,
      cloneContents: () => document.createDocumentFragment(),
      cloneRange: () => document.createRange(),
      collapse: () => {
        return undefined;
      },
      compareBoundaryPoints: () => 0,
      comparePoint: () => 0,
      createContextualFragment: (html: string) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content;
      },
      deleteContents: () => {
        return undefined;
      },
      detach: () => {
        return undefined;
      },
      extractContents: () => document.createDocumentFragment(),
      getBoundingClientRect: () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        toJSON: () => ({}),
      }),
      getClientRects: () => [],
      insertNode: () => {
        return undefined;
      },
      intersectsNode: () => false,
      isPointInRange: () => false,
      selectNode: () => {
        return undefined;
      },
      selectNodeContents: () => {
        return undefined;
      },
      setEndAfter: () => {
        return undefined;
      },
      setEndBefore: () => {
        return undefined;
      },
      setStartAfter: () => {
        return undefined;
      },
      setStartBefore: () => {
        return undefined;
      },
      surroundContents: () => {
        return undefined;
      },
      toString: () => '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
}
if (typeof Element.prototype.getClientRects === 'undefined') {
  Element.prototype.getClientRects = function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [] as any;
  };
}

if (typeof Element.prototype.getBoundingClientRect === 'undefined') {
  Element.prototype.getBoundingClientRect = function () {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      toJSON: () => ({}),
    };
  };
}
if (typeof Element.prototype.animate === 'undefined') {
  Element.prototype.animate = function () {
    return {
      cancel: () => {
        return undefined;
      },
      finish: () => {
        return undefined;
      },
      pause: () => {
        return undefined;
      },
      play: () => {
        return undefined;
      },
      reverse: () => {
        return undefined;
      },
      updatePlaybackRate: () => {
        return undefined;
      },
      addEventListener: () => {
        return undefined;
      },
      removeEventListener: () => {
        return undefined;
      },
      dispatchEvent: () => true,
      currentTime: 0,
      effect: null,
      finished: Promise.resolve(),
      id: '',
      oncancel: null,
      onfinish: null,
      onremove: null,
      pending: false,
      playState: 'finished',
      playbackRate: 1,
      ready: Promise.resolve(),
      replaceState: 'active',
      startTime: 0,
      timeline: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  };
}
if (typeof global.DragEvent === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).DragEvent = class DragEvent extends Event {
    dataTransfer: DataTransfer | null;
    constructor(type: string, eventInitDict?: DragEventInit) {
      super(type, eventInitDict);
      this.dataTransfer = eventInitDict?.dataTransfer || null;
    }
  };
}
if (typeof global.DataTransfer === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).DataTransfer = class DataTransfer {
    dropEffect: 'none' | 'copy' | 'link' | 'move' = 'none';
    effectAllowed = 'all';
    files: FileList = [] as unknown as FileList;
    items: DataTransferItemList = [] as unknown as DataTransferItemList;
    types: string[] = [];

    clearData(): void {
      return undefined;
    }
    getData(): string {
      return '';
    }
    setData(): void {
      return undefined;
    }
    setDragImage(): void {
      return undefined;
    }
  };
}
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = function () {
    return 'blob:mock-url';
  };
}

if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = function () {
    return undefined;
  };
}
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jasmine {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function any(expectedClass: any): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function stringContaining(str: string): any;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jasmine = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(globalThis as any).jasmine,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any: (expectedClass: any) => expect.any(expectedClass),
  stringContaining: (str: string) => expect.stringContaining(str),
};
