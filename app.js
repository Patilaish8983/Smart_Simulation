const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('webcam');

const cfgWidthInput = document.getElementById('cfgWidth');
const cfgHeightInput = document.getElementById('cfgHeight');

let furnitureList = [];
let selectedObject = null;
let offsetX = 0;
let offsetY = 0;
let isCameraActive = false;

// 1. Core Architectural Drawing Engine
function drawSimulation() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (!isCameraActive) {
    canvas.style.background = "#ffffff";
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    // Draw engineering grid lines every 50cm
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  } else {
    canvas.style.background = "transparent";
  }

  furnitureList.forEach(item => {
    ctx.save();
    
    // Setup soft object drop shadows for realistic depth projection
    ctx.shadowColor = item.hasCollision ? 'rgba(239, 68, 68, 0.4)' : 'rgba(15, 23, 42, 0.15)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Base fill styles (Glassmorphism layout colors over live cameras)
    ctx.fillStyle = item.hasCollision ? 'rgba(254, 226, 226, 0.85)' : 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = item.hasCollision ? '#ef4444' : (item === selectedObject ? '#2A7BDE' : '#64748b');
    ctx.lineWidth = item === selectedObject ? 3 : 2;

    // Draw main structural boundary container rectangle
    ctx.beginPath();
    ctx.roundRect(item.x, item.y, item.width, item.height, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore(); // Drop shadow off for interior detail rendering

    // RENDER INTERIOR BLUEPRINT DETAIL STYLES (Realistic Graphics Mode)
    ctx.strokeStyle = item.hasCollision ? 'rgba(239,68,68,0.5)' : 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 1.5;

    if (item.type === 'sofa') {
      // Draw Sofa Backrest line
      ctx.strokeRect(item.x + 5, item.y + 5, item.width - 10, 15);
      // Draw Armrests
      ctx.strokeRect(item.x + 5, item.y + 5, 12, item.height - 10);
      ctx.strokeRect(item.x + item.width - 17, item.y + 5, 12, item.height - 10);
      // Cushion Seating Partition vectors
      let mid = item.width / 2;
      ctx.beginPath(); ctx.moveTo(item.x + mid, item.y + 20); ctx.lineTo(item.x + mid, item.y + item.height - 5); ctx.stroke();
    } 
    else if (item.type === 'table') {
      // Draw clean structural inner wood panels layout lines
      ctx.strokeRect(item.x + 8, item.y + 8, item.width - 16, item.height - 16);
      ctx.beginPath();
      ctx.moveTo(item.x + 8, item.y + 8); ctx.lineTo(item.x + item.width - 8, item.y + item.height - 8);
      ctx.moveTo(item.x + item.width - 8, item.y + 8); ctx.lineTo(item.x + 8, item.y + item.height - 8);
      ctx.stroke();
    } 
    else if (item.type === 'bed') {
      // Pillow vectors mapping
      ctx.strokeRect(item.x + 10, item.y + 10, (item.width - 30)/2, 30);
      ctx.strokeRect(item.x + 20 + (item.width - 30)/2, item.y + 10, (item.width - 30)/2, 30);
      // Blanket duvet top sheet lines folding vectors
      ctx.beginPath(); ctx.moveTo(item.x + 5, item.y + 55); ctx.lineTo(item.x + item.width - 5, item.y + 55); ctx.stroke();
    }

    // DRAW DIMENSION MEASUREMENT TEXT LABELS (User Centric Readouts)
    ctx.fillStyle = item.hasCollision ? '#b91c1c' : '#0f172a';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    
    // Label asset header name text string
    ctx.fillText(item.name, item.x + item.width / 2, item.y + item.height / 2 + 4);

    // Draw precise width readout line string overlay below asset bounds
    ctx.font = '9px monospace';
    ctx.fillText(`${item.width} cm`, item.x + item.width / 2, item.y + item.height + 14);
    // Draw precise depth readout line string layout vertically right of boundary box
    ctx.save();
    ctx.translate(item.x + item.width + 12, item.y + item.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(`${item.height} cm`, 0, 0);
    ctx.restore();
  });
}

// 2. Control Panel Parameter Bindings
function syncSidebarInputs() {
  if (selectedObject) {
    cfgWidthInput.removeAttribute('disabled');
    cfgHeightInput.removeAttribute('disabled');
    cfgWidthInput.value = selectedObject.width;
    cfgHeightInput.value = selectedObject.height;
  } else {
    cfgWidthInput.setAttribute('disabled', 'true');
    cfgHeightInput.setAttribute('disabled', 'true');
    cfgWidthInput.value = '';
    cfgHeightInput.value = '';
  }
}

function updateSelectedDimension() {
  if (!selectedObject) return;
  
  let w = parseInt(cfgWidthInput.value) || 20;
  let h = parseInt(cfgHeightInput.value) || 20;

  // Enforce boundary clamping parameters safely
  selectedObject.width = Math.min(Math.max(w, 20), 500);
  selectedObject.height = Math.min(Math.max(h, 20), 500);

  checkCollisions();
  drawSimulation();
}

// 3. System Object Asset Factory Generators
function addFurniture(type) {
  let newItem = { id: Date.now(), type: type, x: 150, y: 150, hasCollision: false };
  
  if (type === 'sofa')  { newItem.name = 'Luxury Sofa'; newItem.width = 180; newItem.height = 90; }
  if (type === 'table') { newItem.name = 'Dining Table'; newItem.width = 120; newItem.height = 120; }
  if (type === 'bed')   { newItem.name = 'Queen Bed'; newItem.width = 160; newItem.height = 200; }
  
  furnitureList.push(newItem);
  selectedObject = newItem; // Focus input options to item instantly
  syncSidebarInputs();
  checkCollisions();
  drawSimulation();
}

// 4. Bounding Matrix Intersection Solver
function checkCollisions() {
  furnitureList.forEach(item => item.hasCollision = false);

  for (let i = 0; i < furnitureList.length; i++) {
    for (let j = i + 1; j < furnitureList.length; j++) {
      let b1 = furnitureList[i];
      let b2 = furnitureList[j];
      if (b1.x < b2.x + b2.width && b1.x + b1.width > b2.x && b1.y < b2.y + b2.height && b1.y + b1.height > b2.y) {
        b1.hasCollision = true;
        b2.hasCollision = true;
      }
    }
  }
}

// 5. Native Mouse Triggers Infrastructure Logic (Fixed Drag Mechanics)
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  selectedObject = null;
  for (let i = furnitureList.length - 1; i >= 0; i--) {
    let item = furnitureList[i];
    if (mouseX >= item.x && mouseX <= item.x + item.width &&
        mouseY >= item.y && mouseY <= item.y + item.height) {
      selectedObject = item;
      item.isDragging = true;
      offsetX = mouseX - item.x;
      offsetY = mouseY - item.y;
      break;
    }
  }
  syncSidebarInputs();
  drawSimulation();
});

canvas.addEventListener('mousemove', (e) => {
  if (!selectedObject || !selectedObject.isDragging) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let targetX = mouseX - offsetX;
  let targetY = mouseY - offsetY;

  // Frame boundary clipping blocks logic
  if (targetX < 0) targetX = 0;
  if (targetY < 0) targetY = 0;
  if (targetX + selectedObject.width > canvas.width) targetX = canvas.width - selectedObject.width;
  if (targetY + selectedObject.height > canvas.height) targetY = canvas.height - selectedObject.height;

  selectedObject.x = targetX;
  selectedObject.y = targetY;

  checkCollisions();
  drawSimulation();
});

window.addEventListener('mouseup', () => {
  furnitureList.forEach(item => item.isDragging = false);
  drawSimulation();
});

// 6. Camera Pipeline Handle Toggle
async function toggleCamera() {
  if (!isCameraActive) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 850, height: 600 } });
      video.srcObject = stream;
      video.style.display = "block";
      isCameraActive = true;
    } catch (err) {
      alert("Camera access configuration error: " + err.message);
    }
  } else {
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    video.style.display = "none";
    video.srcObject = null;
    isCameraActive = false;
  }
  drawSimulation();
}

// Initial Canvas Boot Trigger
drawSimulation();
