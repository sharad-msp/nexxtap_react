import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface DragDropItem {
  id: string | number;
  [key: string]: any;
}

interface DragDropListProps<T extends DragDropItem> {
  items: T[];
  onReorder: (reorderedItems: T[]) => void;
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  dragHandleClassName?: string;
}

export function DragDropList<T extends DragDropItem>({
  items,
  onReorder,
  renderItem,
  className = '',
  itemClassName = '',
  dragHandleClassName = ''
}: DragDropListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Simple approach: create new array by moving the item
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    
    // Remove the item from its current position
    newItems.splice(draggedIndex, 1);
    
    // Insert at the new position
    newItems.splice(dropIndex, 0, draggedItem);
    
    // Update display_order for all items
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));

    console.log('Drag operation:', {
      draggedIndex,
      dropIndex,
      originalOrder: items.map(item => item.id),
      newOrder: newItems.map(item => item.id)
    });

    onReorder(reorderedItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            transition-all duration-200 ease-in-out
            ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
            ${dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            ${itemClassName}
          `}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`
                flex items-center justify-center w-8 h-8 cursor-move
                text-gray-400 hover:text-gray-600 transition-colors
                ${dragHandleClassName}
              `}
            >
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1">
              {renderItem(item, index, draggedIndex === index)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DragDropList;
