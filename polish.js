function checkCollisions() {
  // Reset all colors to standard state first
  furnitureList.forEach(item => {
    if (item.name === 'Sofa') item.color = '#3b82f6';
    if (item.name === 'Table') item.color = '#10b981';
    if (item.name === 'Bed') item.color = '#f59e0b';
  });

  // Evaluate overlapping pairs
  for (let i = 0; i < furnitureList.length; i++) {
    for (let j = i + 1; j < furnitureList.length; j++) {
      let b1 = furnitureList[i];
      let b2 = furnitureList[j];

      // AABB overlap condition logic
      if (b1.x < b2.x + b2.width &&
          b1.x + b1.width > b2.x &&
          b1.y < b2.y + b2.height &&
          b1.y + b1.height > b2.y) {
        
        // Visual warning alert state: turn overlapping items red
        b1.color = '#ef4444';
        b2.color = '#ef4444';
      }
    }
  }
}
