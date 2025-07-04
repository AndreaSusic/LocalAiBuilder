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
  return (
    <Tag
      {...rest}
      data-edit={path}
      data-editable="true"
      className={`editable ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}