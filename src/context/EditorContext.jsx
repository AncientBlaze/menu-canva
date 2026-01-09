import { useState, createContext, useContext } from 'react';
const EditorContext = createContext(null);


export const EditorProvider = ({ children }) => {
  const [canvas, setCanvas] = useState(null);
  const [activeObject, setActiveObject] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [objects, setObjects] = useState([]);

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