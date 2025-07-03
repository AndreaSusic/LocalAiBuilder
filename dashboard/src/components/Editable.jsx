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
      data-edit={path}
      className={`editable ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}