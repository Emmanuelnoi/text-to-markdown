export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export const HELP_ACCORDION_ITEMS: AccordionItem[] = [
  {
    id: 'how-it-works',
    title: 'How it works',
    content:
      'Paste your text into the editor for automatic Markdown conversion. Export options include clipboard copy and .md file download. Text selection activates the formatting toolbar.',
  },
  {
    id: 'what-is-markdown',
    title: 'What is Markdown?',
    content:
      'Markdown is a simple text formatting language that converts plain text into HTML. It uses symbols like * and # to format text without complex coding.',
  },
  {
    id: 'why-markdown',
    title: 'Why Markdown over rich text editors?',
    content:
      'Markdown is portable, platform-independent, and future-proof. It can be used in many applications, converted to many formats, and can be read as plain text even without specialized software.',
  },
  {
    id: 'html-in-markdown',
    title: 'Can I use HTML in Markdown?',
    content:
      "Yes, you can use HTML in Markdown documents. If you prefer certain HTML tags to Markdown syntax, you can use them and they'll work fine in most Markdown processors.",
  },
  {
    id: 'platforms-support',
    title: 'Do all platforms support the same Markdown?',
    content:
      'Basic Markdown is universal, but some platforms have their own extensions (like GitHub-flavored Markdown). Stick to basics for maximum compatibility.',
  },
];
