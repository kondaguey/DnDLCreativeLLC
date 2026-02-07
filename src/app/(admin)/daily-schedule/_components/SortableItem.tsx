
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    showHandle?: boolean;
}

export default function SortableItem({ id, children, showHandle = false }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="outline-none relative group/sortable">
            {showHandle ? (
                <div className="flex items-center gap-4">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                        <GripVertical size={20} />
                    </div>
                    <div className="flex-grow">
                        {children}
                    </div>
                </div>
            ) : (
                children
            )}
        </div>
    );
}
