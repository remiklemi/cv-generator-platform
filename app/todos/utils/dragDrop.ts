export interface DraggedItem {
  id: string;
  index: number;
}

export const handleDragStart = (e: React.DragEvent, id: string, index: number) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('draggedItem', JSON.stringify({ id, index }));
};

export const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

export const handleDrop = (e: React.DragEvent): DraggedItem | null => {
  e.preventDefault();
  try {
    return JSON.parse(e.dataTransfer.getData('draggedItem'));
  } catch {
    return null;
  }
};
