import React, { useCallback, useEffect, useState } from "react";
import MonacoEditor from "react-monaco-editor";
import DomToImage from 'dom-to-image';

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

function App() {
  const { height, width } = useWindowSize();
  const [code, setCode] = useState('<span>\n  Text Content\n</span>');
  const [zoom, setZoom] = useState('2');
  const [exportScale, setExportScale] = useState('4');
  const [fontColor, setFontColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('serif');
  
  const onChange = useCallback((x) => {
    setCode(x);
  }, []);
  const onZoomChange = useCallback((x) => {
    setZoom(x.currentTarget.value === 'CUSTOM' ? parseFloat(prompt('Custom Zoom Level', zoom)) || zoom : x.currentTarget.value);
  }, [zoom]);
  const onExportScaleChange = useCallback((x) => {
    setExportScale(x.currentTarget.value === 'CUSTOM' ? parseFloat(prompt('Custom Export Scale', exportScale)) || exportScale : x.currentTarget.value);
  }, [exportScale]);
  const onFontSizeChange = useCallback((x) => {
    setFontSize(x.currentTarget.value === 'CUSTOM' ? parseFloat(prompt('Custom Font Size', fontSize)) || fontSize : x.currentTarget.value);
  }, [fontSize]);
  const onFontFamilyChange = useCallback((x) => {
    setFontFamily(x.currentTarget.value === 'CUSTOM' ? prompt('Custom Font Name', fontFamily) || fontFamily : x.currentTarget.value);
  }, [fontFamily]);
  const onFontColorChange = useCallback((x) => {
    setFontColor(x.currentTarget.value);
  }, []);
  const onExport = useCallback((x) => {
    const type = x.currentTarget.value;

    const render = document.getElementById('render').contentDocument.querySelector('body > div');
    render.style.width = 'max-content';
    render.style.height = 'max-content';
    render.style.position = 'absolute';
    render.style.top = '0';
    render.style.left = '0';
    render.style.fontSize = fontSize + 'px';
    render.style.color = fontColor;
    render.style.zoom = exportScale;
    render.style.fontFamily = fontFamily;
    render.innerHTML = code;

    DomToImage[type === 'JPEG' ? 'toJpeg' : type === 'png' ? 'toPng' : 'toSVG'](render, {
      bgcolor: type === 'JPEG'
        ? 'white'
        : undefined,
      width: render.offsetWidth * exportScale,
      height: render.offsetHeight * exportScale,
    })
      .then(function(dataUrl) {
        const link = document.createElement('a');
        link.download = 'my-image-name.png';
        link.href = dataUrl;
        link.click();
      });
  }, [code, exportScale, fontColor, fontSize, fontFamily]);

  const pageCode = `<style>body>div {zoom:${zoom};font-size:${fontSize}px;font-family:${fontFamily};color:${fontColor};}</style><div>${code}</div>`;

  return <div style={{ display: 'flex', flexDirection: 'column', top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', overflow: 'hidden' }}>
    <div id='top'>
      <iframe src="/render.html" width="1000" height="1000" frameBorder="0" title='Render' id='render' style={{ position: 'fixed', opacity: 0, zIndex: 10, pointerEvents: 'none' }}></iframe>
      <h1>HTML Text Making Sandbox</h1>
      <div id="controls">
        <div className="row">
          <strong style={{ color: 'red '}}>Exporting: </strong>
          <select name="zoom" value="EXPORT" onChange={onExport}>
            <option value="EXPORT" disabled>EXPORT</option>
            <option value="PNG">Export .PNG</option>
            <option value="JPEG">Export .JPEG</option>
            <option value="SVG">Export .SVG</option>
          </select> &nbsp;&nbsp;&nbsp;&nbsp;
          <strong>Export Scale</strong>{' '}
          <select name="exportScale" value={exportScale} onChange={onExportScaleChange}>
            <option value="CUSTOM">[Custom]</option>
            { !["1", "2", "4", "6", "8"].includes(zoom) && <option value={zoom}>Custom: {zoom}x</option> }
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="4">4x</option>
            <option value="6">6x</option>
            <option value="8">8x</option>
          </select>
&nbsp;&nbsp;&nbsp;&nbsp; <strong>File Name</strong> <span>{}</span>
          <input type="text" defaultValue='text{i}' id="filenameBase"/>
        </div>
        <div className="row">
          <strong style={{ color: 'red '}}>Preview: </strong>
          <strong>Zoom Level</strong>{' '}
          <select name="zoom" value={zoom} onChange={onZoomChange}>
            <option value="CUSTOM">[Custom]</option>
            { !["0.5", "1", "1.5", "2", "2.5", "3", "4"].includes(zoom) && <option value={zoom}>Custom: {zoom}x</option> }
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
            <option value="2.5">2.5x</option>
            <option value="3">3x</option>
            <option value="4">4x</option>
          </select>
        </div>
        <div className='row'>
          <strong style={{ color: 'red '}}>Global Settings: </strong>
          <strong>Font Color</strong>{' '}
          <input type="color" onChange={onFontColorChange} value={fontColor}/>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <strong>Font Size</strong>{' '}
          <select name="zoom" value={fontSize} onChange={onFontSizeChange}>
            <option value="CUSTOM">[Custom]</option>
            { !["14", "16", "18", "24", "36", "48"].includes(fontSize) && <option value={fontSize}>Custom: {fontSize}px</option> }
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="24">24px</option>
            <option value="36">36px</option>
            <option value="48">48pxx</option>
          </select>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <strong>Font</strong>{' '}
          <select name="fontFamily" value={fontFamily} onChange={onFontFamilyChange}>
            <option value="CUSTOM">[Custom]</option>
            { !["serif", "sans-serif", "monospace", "cursive"].includes(fontFamily) && <option value={fontFamily}>Custom: {fontFamily}</option> }
            <option value="serif">Default Serif</option>
            <option value="sans-serif">Default Sans Serif</option>
            <option value="monospace">Default Monospace</option>
            <option value="cursive">Default Cursive</option>
          </select>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex' }}>
      <div style={{ flex: '0 0 33%'}}>
        <MonacoEditor
          width={(width * 0.33) || 10}
          height={height - 85 || 10}
          language="html"
          theme="vs-light"
          value={code}
          options={{ }}
          onChange={onChange}
        />
      </div>
      <iframe id='result' sandbox="" src={'data:text/html,' + encodeURIComponent(pageCode)} frameBorder="0" title='Result' />
    </div>
  </div>
}

export default App;
