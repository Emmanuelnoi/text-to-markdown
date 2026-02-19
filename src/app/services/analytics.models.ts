export interface AnalyticsEventMap {
  Export: { format: 'markdown'; method: 'copy' | 'download' };
  Import: { method: 'file' | 'url'; fileType?: string; retries?: string };
  'Theme Changed': { theme: 'dark' | 'light' };
  'Template Used': { template: 'readme' | 'blog' | 'meeting' | 'docs' };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
export type AnalyticsEventProperties<TEvent extends AnalyticsEventName> = AnalyticsEventMap[TEvent];
