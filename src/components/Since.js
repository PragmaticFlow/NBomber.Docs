import React from 'react';

/**
 * Marks API that is available starting from a specific version.
 * Usage in .md/.mdx docs (registered globally in src/theme/MDXComponents.js, no import needed):
 *
 *   <Since version="7.0.0" />
 *
 * Put it on its own line under a heading (not inside the heading), so TOC entries and anchors stay clean.
 */
export default function Since({ version }) {
  return (
    <span
      className="badge badge--success since-badge"
      title={`Available starting from version ${version}`}
    >
      {version}+
    </span>
  );
}
