import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { vi } from 'vitest';

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Add Jasmine compatibility for Angular tests
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

// Jasmine compatibility layer
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

// Global spyOn function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).spyOn = vi.spyOn;

// Set test environment flag
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).VITEST_ENVIRONMENT = true;

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      /* mock */
    },
    removeListener: () => {
      /* mock */
    },
    addEventListener: () => {
      /* mock */
    },
    removeEventListener: () => {
      /* mock */
    },
    dispatchEvent: () => true,
  }),
});

// Mock localStorage
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

// Mock Plausible analytics
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).plausible = vi.fn();

// Mock document.createElement to return proper elements for TipTap
const originalCreateElement = document.createElement.bind(document);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
document.createElement = function (tagName: string, options?: any) {
  const element = originalCreateElement(tagName, options);

  // Ensure all necessary methods exist for ProseMirror/TipTap
  if (!element.getRootNode) {
    element.getRootNode = () => document;
  }

  return element;
};

// Ensure document.body exists
if (!document.body) {
  document.body = document.createElement('body');
}

// Mock Selection API for ProseMirror
if (!window.getSelection) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).getSelection = () => ({
    removeAllRanges: () => {
      /* mock */
    },
    addRange: () => {
      /* mock */
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

// Mock DOMRect for ProseMirror
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

// Mock Range for ProseMirror
if (!document.createRange) {
  document.createRange = () =>
    ({
      setStart: () => {
        /* mock */
      },
      setEnd: () => {
        /* mock */
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
        /* mock */
      },
      compareBoundaryPoints: () => 0,
      comparePoint: () => 0,
      createContextualFragment: (html: string) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content;
      },
      deleteContents: () => {
        /* mock */
      },
      detach: () => {
        /* mock */
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
        /* mock */
      },
      intersectsNode: () => false,
      isPointInRange: () => false,
      selectNode: () => {
        /* mock */
      },
      selectNodeContents: () => {
        /* mock */
      },
      setEndAfter: () => {
        /* mock */
      },
      setEndBefore: () => {
        /* mock */
      },
      setStartAfter: () => {
        /* mock */
      },
      setStartBefore: () => {
        /* mock */
      },
      surroundContents: () => {
        /* mock */
      },
      toString: () => '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
}

// Mock getClientRects for elements
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

// Mock element.animate for Angular animations
if (typeof Element.prototype.animate === 'undefined') {
  Element.prototype.animate = function () {
    return {
      cancel: () => {
        /* mock */
      },
      finish: () => {
        /* mock */
      },
      pause: () => {
        /* mock */
      },
      play: () => {
        /* mock */
      },
      reverse: () => {
        /* mock */
      },
      updatePlaybackRate: () => {
        /* mock */
      },
      addEventListener: () => {
        /* mock */
      },
      removeEventListener: () => {
        /* mock */
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

// Mock DragEvent for drag and drop tests
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

// Mock DataTransfer for drag and drop tests
if (typeof global.DataTransfer === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).DataTransfer = class DataTransfer {
    dropEffect: 'none' | 'copy' | 'link' | 'move' = 'none';
    effectAllowed = 'all';
    files: FileList = [] as unknown as FileList;
    items: DataTransferItemList = [] as unknown as DataTransferItemList;
    types: string[] = [];

    clearData(): void {
      /* mock */
    }
    getData(): string {
      return '';
    }
    setData(): void {
      /* mock */
    }
    setDragImage(): void {
      /* mock */
    }
  };
}

// Mock URL.createObjectURL and revokeObjectURL
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = function () {
    return 'blob:mock-url';
  };
}

if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = function () {
    /* mock */
  };
}

// Add jasmine.any compatibility for expect.any
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jasmine {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function any(expectedClass: any): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function stringContaining(str: string): any;
  }
}

// Add jasmine.any and jasmine.stringContaining for Jasmine compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jasmine = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(globalThis as any).jasmine,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any: (expectedClass: any) => expect.any(expectedClass),
  stringContaining: (str: string) => expect.stringContaining(str),
};
