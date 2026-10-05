import React from 'react';
import { Pencil, Trash2, Puzzle } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';
import { ListRow, IconButton } from '../cms-ui';

const ComponentCard = ({ component, onEdit, onDelete }) => {
  const widgetDefinition = availableWidgets.find((w) => w.type === component.type);

  return (
    <ListRow>
      {/* Left: Icon & Name */}
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-fill rounded-lg text-secondary">
        {widgetDefinition?.icon || <Puzzle size={16} strokeWidth={1.75} />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-medium tracking-[-0.01em] text-label truncate">{component.name}</h3>
        <p className="text-[13px] text-secondary mt-0.5 truncate">
          {new Date(component.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
          {/* Config summary */}
          {component.type === 'banner_carousel' && (
            <> · <span className="tabular-nums">{component.config?.items?.length || 0}</span> slides</>
          )}
          {component.type === 'inventory_discovery' && (
            <> · {component.config?.assetType || 'All Assets'} · {component.config?.zone || 'All Zones'}</>
          )}
        </p>
      </div>

      <span className="shrink-0 text-[12px] text-tertiary tabular-nums">{component.id}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 justify-end shrink-0">
        <IconButton icon={Pencil} label="Edit" onClick={() => onEdit(component)} />
        <IconButton
          icon={Trash2}
          label="Delete"
          onClick={() => onDelete(component.id)}
          className="hover:text-danger! hover:bg-danger-soft!"
        />
      </div>
    </ListRow>
  );
};

export default ComponentCard;
