import React from 'react';
import { EditorProvider } from './context/EditorContext';
import CanvasEditor from './components/CanvasEditor';

export default function App() {
  return (
    <EditorProvider>
      <CanvasEditor />
    </EditorProvider>
  );
}