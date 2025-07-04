/**
 * Editable.jsx
 * Wrap ANY element; adds data-edit + optional extra classes.
 */
import React from 'react';

export default function Editable({
  path,
  as: Tag = 'span',
  className = '',
  children,
  ...rest
}) {
  // Debug logging
  console.log(`Editable rendering: ${Tag} with path="${path}"`);
  
  return (
    <Tag
      {...rest}
      data-edit={path}
      data-editable="true"
      className={`editable ${className}`.trim()}
      style={{
        ...rest.style,
        border: '1px dashed red' // Temporary visual indicator
      }}
    >
      {children}
    </Tag>
  );
}