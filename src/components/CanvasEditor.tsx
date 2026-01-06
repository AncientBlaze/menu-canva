import { useEffect, useRef, useState } from 'react';
import { 
  Square, Circle, Type, Download, 
  Trash2, Copy, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Palette, Layers, X, QrCode, FileDown
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';

declare global {
  interface Window {
    fabric: any;
    jspdf: any;
  }
}

const CanvasEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const { canvas, setCanvas, activeObject, setActiveObject, objects, setObjects } = useEditor();
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (window.fabric) {
      setFabricLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
    script.async = true;
    script.onload = () => setFabricLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!fabricLoaded || !canvasRef.current) return;

    const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    fabricCanvasRef.current = fabricCanvas;
    setCanvas(fabricCanvas);

    const updateObjects = () => {
      const allObjects = fabricCanvas.getObjects().map((obj: { id: any; type: any; name: any; }, index: number) => ({
        id: obj.id || `object-${index}`,
        type: obj.type,
        name: obj.name || `${obj.type} ${index + 1}`
      }));
      setObjects(allObjects);
    };

    fabricCanvas.on('selection:created', (e: { selected: any[]; target: any; }) => {
      setActiveObject(e.selected ? e.selected[0] : e.target);
    });
    fabricCanvas.on('selection:updated', (e: { selected: any[]; target: any; }) => {
      setActiveObject(e.selected ? e.selected[0] : e.target);
    });
    fabricCanvas.on('selection:cleared', () => setActiveObject(null));

    fabricCanvas.on('object:added', updateObjects);
    fabricCanvas.on('object:removed', updateObjects);
    fabricCanvas.on('object:modified', updateObjects);

    updateObjects();

    return () => {
      fabricCanvas.dispose();
    };
  }, [fabricLoaded]);

  const addRectangle = () => {
    if (!fabricCanvasRef.current) return;
    
    const rect = new window.fabric.Rect({
      left: 100,
      top: 100,
      fill: '#3b82f6',
      width: 200,
      height: 150,
      cornerColor: '#3b82f6',
      cornerSize: 10,
      transparentCorners: false
    });
    
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;
    
    const circle = new window.fabric.Circle({
      left: 150,
      top: 150,
      fill: '#10b981',
      radius: 80,
      cornerColor: '#10b981',
      cornerSize: 10,
      transparentCorners: false
    });
    
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    
    const text = new window.fabric.IText('Double-click to edit', {
      left: 100,
      top: 100,
      fontSize: 32,
      fontFamily: 'Inter, sans-serif',
      fill: '#1f2937',
      cornerColor: '#3b82f6',
      cornerSize: 10,
      transparentCorners: false
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const active = fabricCanvasRef.current.getActiveObject();
    if (active) {
      fabricCanvasRef.current.remove(active);
      fabricCanvasRef.current.renderAll();
    }
  };

  const duplicateSelected = () => {
    if (!fabricCanvasRef.current) return;
    const active = fabricCanvasRef.current.getActiveObject();
    if (active) {
      active.clone((cloned: { set: (arg0: { left: any; top: any; }) => void; left: number; top: number; }) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20
        });
        fabricCanvasRef.current.add(cloned);
        fabricCanvasRef.current.setActiveObject(cloned);
        fabricCanvasRef.current.renderAll();
      });
    }
  };

  const changeColor = (color: string) => {
    if (!fabricCanvasRef.current) return;
    const active = fabricCanvasRef.current.getActiveObject();
    if (active) {
      active.set({ fill: color });
      fabricCanvasRef.current.renderAll();
    }
  };

  const exportCanvas = () => {
    if (!fabricCanvasRef.current) return;
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1
    });
    const link = document.createElement('a');
    link.download = 'canvas-design.png';
    link.href = dataURL;
    link.click();
  };

  const exportToPDF = async () => {
    if (!fabricCanvasRef.current) return;
    
    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => exportToPDF();
      document.body.appendChild(script);
      return;
    }

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: fabricCanvasRef.current.width > fabricCanvasRef.current.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [fabricCanvasRef.current.width, fabricCanvasRef.current.height]
    });

    pdf.addImage(dataURL, 'PNG', 0, 0, fabricCanvasRef.current.width, fabricCanvasRef.current.height);
    pdf.save('canvas-design.pdf');
  };

  const generateQRPreview = () => {
    if (!fabricCanvasRef.current) return;
    
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 0.8
    });
    
    const qrData = encodeURIComponent(window.location.href);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
    
    setQrCodeUrl(qrUrl);
    setShowQRPreview(true);
  };

  const toggleBold = () => {
    if (!fabricCanvasRef.current) return;
    const active = fabricCanvasRef.current.getActiveObject();
    if (active && active.type === 'i-text') {
      active.set({ fontWeight: active.fontWeight === 'bold' ? 'normal' : 'bold' });
      fabricCanvasRef.current.renderAll();
    }
  };

  const toggleItalic = () => {
    if (!fabricCanvasRef.current) return;
    const active = fabricCanvasRef.current.getActiveObject();
    if (active && active.type === 'i-text') {
      active.set({ fontStyle: active.fontStyle === 'italic' ? 'normal' : 'italic' });
      fabricCanvasRef.current.renderAll();
    }
  };

  const setTextAlign = (align: string) => {
    if (!fabricCanvasRef.current) return;
    const active = fabricCanvasRef.current.getActiveObject();
    if (active && active.type === 'i-text') {
      active.set({ textAlign: align });
      fabricCanvasRef.current.renderAll();
    }
  };

  const selectObject = (index: number) => {
    if (!fabricCanvasRef.current) return;
    const obj = fabricCanvasRef.current.item(index);
    if (obj) {
      fabricCanvasRef.current.setActiveObject(obj);
      fabricCanvasRef.current.renderAll();
    }
  };

  const deleteObjectByIndex = (index: number) => {
    if (!fabricCanvasRef.current) return;
    const obj = fabricCanvasRef.current.item(index);
    if (obj) {
      fabricCanvasRef.current.remove(obj);
      fabricCanvasRef.current.renderAll();
    }
  };

  if (!fabricLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Canvas Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          title="Toggle Layers"
        >
          <Layers size={18} />
          Layers ({objects.length})
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        <button
          onClick={addRectangle}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Square size={18} />
          Rectangle
        </button>
        <button
          onClick={addCircle}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <Circle size={18} />
          Circle
        </button>
        <button
          onClick={addText}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          <Type size={18} />
          Text
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        {activeObject && (
          <>
            <button
              onClick={duplicateSelected}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Duplicate"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={deleteSelected}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>

            {activeObject.type === 'i-text' && (
              <>
                <div className="h-6 w-px bg-gray-300 mx-2" />
                <button
                  onClick={toggleBold}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Bold"
                >
                  <Bold size={18} />
                </button>
                <button
                  onClick={toggleItalic}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Italic"
                >
                  <Italic size={18} />
                </button>
                <button
                  onClick={() => setTextAlign('left')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Align Left"
                >
                  <AlignLeft size={18} />
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Align Center"
                >
                  <AlignCenter size={18} />
                </button>
                <button
                  onClick={() => setTextAlign('right')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Align Right"
                >
                  <AlignRight size={18} />
                </button>
              </>
            )}

            <div className="h-6 w-px bg-gray-300 mx-2" />
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-gray-600" />
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#1f2937'].map(color => (
                <button
                  key={color}
                  onClick={() => changeColor(color)}
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:scale-110 transition"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </>
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={generateQRPreview}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            title="Quick Preview QR"
          >
            <QrCode size={18} />
            QR Preview
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            title="Export to PDF"
          >
            <FileDown size={18} />
            PDF
          </button>
          <button
            onClick={exportCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            <Download size={18} />
            PNG
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Layers size={18} />
                  Layers
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                {objects.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No objects yet
                  </p>
                ) : (
                  objects.map((obj, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition cursor-pointer ${
                        activeObject === fabricCanvasRef.current?.item(index)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => selectObject(index)}
                    >
                      <div className="flex items-center gap-2">
                        {obj.type === 'rect' && <Square size={16} className="text-blue-500" />}
                        {obj.type === 'circle' && <Circle size={16} className="text-green-500" />}
                        {obj.type === 'i-text' && <Type size={16} className="text-purple-500" />}
                        <span className="text-sm font-medium capitalize">
                          {obj.type === 'i-text' ? 'Text' : obj.type}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteObjectByIndex(index);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600 flex items-center gap-4">
        <span>Canvas Editor v1.0</span>
        {activeObject && (
          <>
            <span className="text-gray-400">|</span>
            <span>Selected: {activeObject.type}</span>
          </>
        )}
      </div>

      {/* QR Preview Modal */}
      {showQRPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <QrCode size={20} />
                Quick Preview QR Code
              </h3>
              <button
                onClick={() => setShowQRPreview(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-50 p-4 rounded-lg mb-4 inline-block">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to preview your design on mobile
              </p>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = 'qr-code.png';
                  link.href = qrCodeUrl;
                  link.click();
                }}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;
