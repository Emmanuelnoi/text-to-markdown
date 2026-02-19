export type ImportTemplateKey = 'readme' | 'blog' | 'meeting' | 'docs';

export const IMPORT_TEMPLATES: Record<ImportTemplateKey, string> = {
  readme: `# Project Name

## Description
Brief description of your project.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
How to use your project.

## Contributing
Guidelines for contributing.

## License
Your license here.`,

  blog: `# Blog Post Title

*Published on ${new Date().toLocaleDateString()}*

## Introduction
Your introduction here...

## Main Content
Your main content here...

### Subheading
More detailed content...

## Conclusion
Your conclusion here...

---
*Tags: #tag1 #tag2 #tag3*`,

  meeting: `# Meeting Notes - ${new Date().toLocaleDateString()}

## Attendees
- Name 1
- Name 2
- Name 3

## Agenda
1. Item 1
2. Item 2
3. Item 3

## Discussion Points
### Topic 1
Notes...

### Topic 2
Notes...

## Action Items
- [ ] Action item 1 - @assignee - Due: date
- [ ] Action item 2 - @assignee - Due: date

## Next Meeting
Date: TBD
Time: TBD`,

  docs: `# Documentation Title

## Overview
Brief overview of the feature/component.

## Installation
\`\`\`bash
npm install package-name
\`\`\`

## API Reference

### Method Name
\`\`\`typescript
methodName(param: string): ReturnType
\`\`\`

**Parameters:**
- \`param\`: Description of parameter

**Returns:**
Description of return value

**Example:**
\`\`\`typescript
const result = methodName('value');
\`\`\`

## Examples
More detailed examples...

## Troubleshooting
Common issues and solutions.`,
};
