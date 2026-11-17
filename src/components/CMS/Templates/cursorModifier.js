// Pins the drag chip to the pointer (instead of the grabbed card's corner), so it appears
// exactly where the cursor is.
export const snapToCursor = ({ transform, activatorEvent, activeNodeRect }) => {
  if (!activatorEvent || !activeNodeRect) return transform;
  const x = (activatorEvent.clientX ?? activatorEvent.touches?.[0]?.clientX ?? 0) - activeNodeRect.left;
  const y = (activatorEvent.clientY ?? activatorEvent.touches?.[0]?.clientY ?? 0) - activeNodeRect.top;
  return { ...transform, x: transform.x + x - 16, y: transform.y + y - 18 };
};

// Drop target = the gap whose centre is nearest the pointer, as long as the pointer is over the
// layout column (same x-range as the gaps). Dropping anywhere else does nothing.
export const gapCollision = ({ droppableContainers, droppableRects, pointerCoordinates }) => {
  if (!pointerCoordinates) return [];
  let best = null;
  let bestDist = Infinity;
  droppableContainers.forEach((container) => {
    const r = droppableRects.get(container.id);
    if (!r || pointerCoordinates.x < r.left || pointerCoordinates.x > r.right) return;
    const dist = Math.abs(pointerCoordinates.y - (r.top + r.height / 2));
    if (dist < bestDist) {
      best = container;
      bestDist = dist;
    }
  });
  return best ? [{ id: best.id }] : [];
};
