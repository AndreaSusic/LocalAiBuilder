import React from 'react'
import { FaBold, FaItalic, FaUnderline } from 'react-icons/fa'
import { MdImage, MdOndemandVideo } from 'react-icons/md'

/**
 * Renders a row of icon buttons for common editing actions.
 * onAction receives one of: 'bold' | 'italic' | 'underline' | 'insertImage' | 'insertVideo'
 */
export function EditorToolbar({ onAction }) {
  const renderBtn = (Icon, action, label) => (
    <button
      key={action}
      onClick={() => onAction(action)}
      aria-label={label}
      className="p-2 hover:bg-gray-100 rounded"
    >
      <Icon size={20} />
    </button>
  )

  return (
    <div className="flex gap-2 border-b border-gray-300 mb-2">
      {renderBtn(FaBold, 'bold', 'Bold')}
      {renderBtn(FaItalic, 'italic', 'Italic')}
      {renderBtn(FaUnderline, 'underline', 'Underline')}
      {renderBtn(MdImage, 'insertImage', 'Insert Image')}
      {renderBtn(MdOndemandVideo, 'insertVideo', 'Insert Video')}
    </div>
  )
}