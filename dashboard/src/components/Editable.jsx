/**
 * Editable.jsx
 * Enhanced editable component with React state-based undo/redo support
 */
import React, { useState, useRef, useEffect } from 'react';
import { useSiteDataActions } from '../../../src/context/SiteDataProvider';

export default function Editable({
  path,
  as: Tag = 'span',
  className = '',
  children,
  ...rest
}) {
  const { updateField, updateNestedField } = useSiteDataActions();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef(null);
  
  // Debug logging
  console.log(`Editable rendering: ${Tag} with path="${path}"`);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(typeof children === 'string' ? children : '');
  };
  
  const handleBlur = () => {
    if (isEditing && editValue !== children) {
      // Handle nested paths (e.g. "contact.phone")
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        updateNestedField(parent, child, editValue);
      } else {
        updateField(path, editValue);
      }
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(typeof children === 'string' ? children : '');
    }
  };
  
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [isEditing]);
  
  if (isEditing) {
    return (
      <Tag
        {...rest}
        data-edit={path}
        data-editable="true"
        className={`editable editing ${className}`.trim()}
        style={{
          ...rest.style,
          border: '2px solid #ffc000',
          outline: 'none',
          backgroundColor: '#fff9e6'
        }}
        ref={editRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: editValue }}
      />
    );
  }
  
  return (
    <Tag
      {...rest}
      data-edit={path}
      data-editable="true"
      className={`editable ${className}`.trim()}
      style={{
        ...rest.style,
        border: '1px dashed transparent',
        cursor: 'text',
        transition: 'border-color 0.2s',
        ':hover': {
          borderColor: '#ff6b6b'
        }
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={(e) => {
        e.target.style.borderColor = '#ff6b6b';
      }}
      onMouseLeave={(e) => {
        e.target.style.borderColor = 'transparent';
      }}
    >
      {children}
    </Tag>
  );
}