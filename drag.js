canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Search backward to target the topmost element first
  for (let i = furnitureList.length - 1; i >= 0; i--) {
    let item = furnitureList[i];
    // Check if mouse click coordinates fall inside the rectangle
    if (mouseX >= item.x && mouseX <= item.x + item.width &&
        mouseY >= item.y && mouseY <= item.y + item.height) {
      selectedObject = item;
      item.isDragging = true;
      offsetX = mouseX - item.x;
      offsetY = mouseY - item.y;
      break;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!selectedObject || !selectedObject.isDragging) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Target coordinates based on current cursor offset
  let targetX = mouseX - offsetX;
  let targetY = mouseY - offsetY;

  // Wall Boundaries Collision Check
  if (targetX < 0) targetX = 0;
  if (targetY < 0) targetY = 0;
  if (targetX + selectedObject.width > canvas.width) targetX = canvas.width - selectedObject.width;
  if (targetY + selectedObject.height > canvas.height) targetY = canvas.height - selectedObject.height;

  selectedObject.x = targetX;
  selectedObject.y = targetY;

  // Run overlapping checks before redrawing
  checkCollisions();
  drawSimulation();
});

canvas.addEventListener('mouseup', () => {
  if (selectedObject) {
    selectedObject.isDragging = false;
    selectedObject = null;
  }
});

