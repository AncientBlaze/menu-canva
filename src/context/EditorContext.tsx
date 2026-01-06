import React, { createContext, useContext, useState } from 'react';

interface EditorContextType {
  canvas: any;
  setCanvas: (canvas: any) => void;
  activeObject: any;
  setActiveObject: (obj: any) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  objects: any[];
  setObjects: (objects: any[]) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [canvas, setCanvas] = useState<any>(null);
  const [activeObject, setActiveObject] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [objects, setObjects] = useState<any[]>([]);

  return (
    <EditorContext.Provider value={{
      canvas, setCanvas,
      activeObject, setActiveObject,
      zoom, setZoom,
      objects, setObjects
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
};

export default EditorContext;
