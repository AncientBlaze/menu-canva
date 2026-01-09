import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { 
  Square, Circle, Type, Download, 
  Trash2, Copy, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Palette, Layers, X, QrCode, FileDown,
  Triangle, Star, Pentagon, Image, Minus, Plus, Settings,
  Upload, Droplet, Sparkles
} from 'lucide-react';
import { EditorProvider, useEditor } from '../context/EditorContext';




export const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const { canvas, setCanvas, activeObject, setActiveObject, objects, setObjects } = useEditor();
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Property states
  const [objectWidth, setObjectWidth] = useState(0);
  const [objectHeight, setObjectHeight] = useState(0);
  const [objectX, setObjectX] = useState(0);
  const [objectY, setObjectY] = useState(0);
  const [objectRotation, setObjectRotation] = useState(0);
  const [objectOpacity, setObjectOpacity] = useState(1);
  const [objectColor, setObjectColor] = useState('#3b82f6');
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientColor1, setGradientColor1] = useState('#3b82f6');
  const [gradientColor2, setGradientColor2] = useState('#8b5cf6');
  const fileInputRef = useRef(null);

  // Load Fabric.js from CDN
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

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!fabricLoaded || !canvasRef.current) return;

    const fabricCanvas = new window.fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    fabricCanvasRef.current = fabricCanvas;
    setCanvas(fabricCanvas);

    // Update objects list
    const updateObjects = () => {
      const allObjects = fabricCanvas.getObjects().map((obj, index) => ({
        id: obj.id || `object-${index}`,
        type: obj.type,
        name: obj.name || `${obj.type} ${index + 1}`
      }));
      setObjects(allObjects);
    };

    // Selection handlers
    fabricCanvas.on('selection:created', (e) => {
      const obj = e.selected ? e.selected[0] : e.target;
      setActiveObject(obj);
      updateProperties(obj);
    });
    fabricCanvas.on('selection:updated', (e) => {
      const obj = e.selected ? e.selected[0] : e.target;
      setActiveObject(obj);
      updateProperties(obj);
    });
    fabricCanvas.on('selection:cleared', () => {
      setActiveObject(null);
      resetProperties();
    });

    // Object change handlers
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

  const addTriangle = () => {
    if (!fabricCanvasRef.current) return;
    
    const triangle = new window.fabric.Triangle({
      left: 150,
      top: 150,
      fill: '#f59e0b',
      width: 150,
      height: 150,
      cornerColor: '#f59e0b',
      cornerSize: 10,
      transparentCorners: false
    });
    
    fabricCanvasRef.current.add(triangle);
    fabricCanvasRef.current.setActiveObject(triangle);
    fabricCanvasRef.current.renderAll();
  };

  const addLine = () => {
    if (!fabricCanvasRef.current) return;
    
    const line = new window.fabric.Line([50, 100, 250, 100], {
      stroke: '#1f2937',
      strokeWidth: 3,
      cornerColor: '#1f2937',
      cornerSize: 10,
      transparentCorners: false
    });
    
    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
    fabricCanvasRef.current.renderAll();
  };

  const addPolygon = () => {
    if (!fabricCanvasRef.current) return;
    
    const points = [
      { x: 0, y: -50 },
      { x: 48, y: -15 },
      { x: 30, y: 40 },
      { x: -30, y: 40 },
      { x: -48, y: -15 }
    ];
    
    const polygon = new window.fabric.Polygon(points, {
      left: 150,
      top: 150,
      fill: '#8b5cf6',
      cornerColor: '#8b5cf6',
      cornerSize: 10,
      transparentCorners: false
    });
    
    fabricCanvasRef.current.add(polygon);
    fabricCanvasRef.current.setActiveObject(polygon);
    fabricCanvasRef.current.renderAll();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      window.fabric.Image.fromURL(event.target.result, (img) => {
        img.scale(0.5);
        img.set({
          left: 100,
          top: 100,
          cornerColor: '#3b82f6',
          cornerSize: 10,
          transparentCorners: false
        });
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
      });
    };
    reader.readAsDataURL(file);
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
      active.clone((cloned) => {
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

  const changeColor = (color) => {
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
    
    // Load jsPDF from CDN
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
    
    // Generate QR code URL using a free QR API
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

  const setTextAlign = (align) => {
    if (!fabricCanvasRef.current) return;
    const active = fabricCanvasRef.current.getActiveObject();
    if (active && active.type === 'i-text') {
      active.set({ textAlign: align });
      fabricCanvasRef.current.renderAll();
    }
  };

  const selectObject = (index) => {
    if (!fabricCanvasRef.current) return;
    const obj = fabricCanvasRef.current.item(index);
    if (obj) {
      fabricCanvasRef.current.setActiveObject(obj);
      fabricCanvasRef.current.renderAll();
    }
  };

  const deleteObjectByIndex = (index) => {
    if (!fabricCanvasRef.current) return;
    const obj = fabricCanvasRef.current.item(index);
    if (obj) {
      fabricCanvasRef.current.remove(obj);
      fabricCanvasRef.current.renderAll();
    }
  };

  // Property management
  const updateProperties = (obj) => {
    if (!obj) return;
    setObjectWidth(Math.round(obj.getScaledWidth()));
    setObjectHeight(Math.round(obj.getScaledHeight()));
    setObjectX(Math.round(obj.left));
    setObjectY(Math.round(obj.top));
    setObjectRotation(Math.round(obj.angle));
    setObjectOpacity(obj.opacity || 1);
    setObjectColor(obj.fill || '#3b82f6');
  };

  const resetProperties = () => {
    setObjectWidth(0);
    setObjectHeight(0);
    setObjectX(0);
    setObjectY(0);
    setObjectRotation(0);
    setObjectOpacity(1);
    setObjectColor('#3b82f6');
  };

  const applyProperty = (property, value) => {
    if (!fabricCanvasRef.current || !activeObject) return;
    
    const updates = {};
    
    if (property === 'width') {
      updates.scaleX = value / activeObject.width;
    } else if (property === 'height') {
      updates.scaleY = value / activeObject.height;
    } else if (property === 'x') {
      updates.left = value;
    } else if (property === 'y') {
      updates.top = value;
    } else if (property === 'rotation') {
      updates.angle = value;
    } else if (property === 'opacity') {
      updates.opacity = value;
    } else if (property === 'color') {
      updates.fill = value;
    }
    
    activeObject.set(updates);
    fabricCanvasRef.current.renderAll();
  };

  const toggleShadow = () => {
    if (!fabricCanvasRef.current || !activeObject) return;
    
    const newShadowState = !shadowEnabled;
    setShadowEnabled(newShadowState);
    
    if (newShadowState) {
      activeObject.set({
        shadow: new window.fabric.Shadow({
          color: shadowColor,
          blur: shadowBlur,
          offsetX: 5,
          offsetY: 5
        })
      });
    } else {
      activeObject.set({ shadow: null });
    }
    
    fabricCanvasRef.current.renderAll();
  };

  const updateShadow = (property, value) => {
    if (!fabricCanvasRef.current || !activeObject || !shadowEnabled) return;
    
    if (property === 'blur') {
      setShadowBlur(value);
      activeObject.shadow.blur = value;
    } else if (property === 'color') {
      setShadowColor(value);
      activeObject.shadow.color = value;
    }
    
    fabricCanvasRef.current.renderAll();
  };

  const toggleGradient = () => {
    if (!fabricCanvasRef.current || !activeObject) return;
    
    const newGradientState = !gradientEnabled;
    setGradientEnabled(newGradientState);
    
    if (newGradientState) {
      const gradient = new window.fabric.Gradient({
        type: 'linear',
        coords: {
          x1: 0,
          y1: 0,
          x2: activeObject.width,
          y2: activeObject.height
        },
        colorStops: [
          { offset: 0, color: gradientColor1 },
          { offset: 1, color: gradientColor2 }
        ]
      });
      activeObject.set({ fill: gradient });
    } else {
      activeObject.set({ fill: objectColor });
    }
    
    fabricCanvasRef.current.renderAll();
  };

  const updateGradient = (property, value) => {
    if (!fabricCanvasRef.current || !activeObject || !gradientEnabled) return;
    
    if (property === 'color1') {
      setGradientColor1(value);
    } else if (property === 'color2') {
      setGradientColor2(value);
    }
    
    const gradient = new window.fabric.Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: activeObject.width,
        y2: activeObject.height
      },
      colorStops: [
        { offset: 0, color: property === 'color1' ? value : gradientColor1 },
        { offset: 1, color: property === 'color2' ? value : gradientColor2 }
      ]
    });
    
    activeObject.set({ fill: gradient });
    fabricCanvasRef.current.renderAll();
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
          onClick={addTriangle}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          <Triangle size={18} />
          Triangle
        </button>
        <button
          onClick={addPolygon}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          <Pentagon size={18} />
          Pentagon
        </button>
        <button
          onClick={addLine}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          <Minus size={18} />
          Line
        </button>
        <button
          onClick={addText}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
        >
          <Type size={18} />
          Text
        </button>
        
        <div className="h-6 w-px bg-gray-300 mx-2" />
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
        >
          <Upload size={18} />
          Upload Image
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
            onClick={() => setShowProperties(!showProperties)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            title="Toggle Properties"
          >
            <Settings size={18} />
            Properties
          </button>
          <button
            onClick={generateQRPreview}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            title="Quick Preview QR"
          >
            <QrCode size={18} />
            QR
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
                  objects.map((obj, index)=> (
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
                        {obj.type === 'triangle' && <Triangle size={16} className="text-yellow-500" />}
                        {obj.type === 'polygon' && <Pentagon size={16} className="text-purple-500" />}
                        {obj.type === 'line' && <Minus size={16} className="text-gray-600" />}
                        {obj.type === 'i-text' && <Type size={16} className="text-pink-500" />}
                        {obj.type === 'image' && <Image size={16} className="text-cyan-500" />}
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

        {/* Properties Panel */}
        {showProperties && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Settings size={18} />
                  Properties
                </h3>
                <button
                  onClick={() => setShowProperties(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              {activeObject ? (
                <div className="space-y-4">
                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">X</label>
                        <input
                          type="number"
                          value={objectX}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setObjectX(val);
                            applyProperty('x', val);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Y</label>
                        <input
                          type="number"
                          value={objectY}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setObjectY(val);
                            applyProperty('y', val);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Width</label>
                        <input
                          type="number"
                          value={objectWidth}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setObjectWidth(val);
                            applyProperty('width', val);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Height</label>
                        <input
                          type="number"
                          value={objectHeight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setObjectHeight(val);
                            applyProperty('height', val);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rotation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rotation: {objectRotation}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={objectRotation}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setObjectRotation(val);
                        applyProperty('rotation', val);
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opacity: {Math.round(objectOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={objectOpacity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setObjectOpacity(val);
                        applyProperty('opacity', val);
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Color */}
                  {activeObject.type !== 'line' && activeObject.type !== 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fill Color
                      </label>
                      <input
                        type="color"
                        value={objectColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setObjectColor(val);
                          applyProperty('color', val);
                        }}
                        className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Gradient */}
                  {activeObject.type !== 'line' && activeObject.type !== 'image' && activeObject.type !== 'i-text' && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Droplet size={16} />
                          Gradient
                        </label>
                        <button
                          onClick={toggleGradient}
                          className={`px-3 py-1 rounded-lg text-sm transition ${
                            gradientEnabled
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {gradientEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      
                      {gradientEnabled && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Color 1</label>
                            <input
                              type="color"
                              value={gradientColor1}
                              onChange={(e) => updateGradient('color1', e.target.value)}
                              className="w-full h-8 rounded-lg border border-gray-300 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Color 2</label>
                            <input
                              type="color"
                              value={gradientColor2}
                              onChange={(e) => updateGradient('color2', e.target.value)}
                              className="w-full h-8 rounded-lg border border-gray-300 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shadow */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Sparkles size={16} />
                        Shadow
                      </label>
                      <button
                        onClick={toggleShadow}
                        className={`px-3 py-1 rounded-lg text-sm transition ${
                          shadowEnabled
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {shadowEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    
                    {shadowEnabled && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Blur: {shadowBlur}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={shadowBlur}
                            onChange={(e) => updateShadow('blur', Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Color</label>
                          <input
                            type="color"
                            value={shadowColor}
                            onChange={(e) => updateShadow('color', e.target.value)}
                            className="w-full h-8 rounded-lg border border-gray-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={duplicateSelected}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-2"
                    >
                      <Copy size={18} />
                      Duplicate
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Select an object to view properties
                </p>
              )}
            </div>
          </div>
        )}
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


export default function App() {
  return (
    <EditorProvider>
      <CanvasEditor />
    </EditorProvider>
  );
}