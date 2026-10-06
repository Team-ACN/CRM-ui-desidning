import React from 'react';
import { ListGroup } from '../cms-ui';
import PopupRow from './PopupRow';

// One trigger context = one competition. Rank order is shown here; changing it
// happens in the Manage priority screen so a stray drag can't reshuffle live traffic.
const PopupGroup = ({ group, ...rowHandlers }) => {
  const liveCount = group.items.filter((p) => p.status === 'Live').length;

  return (
    <ListGroup
      header={group.label}
      action={
        liveCount > 1 && <p className="text-[12px] text-tertiary">Top live one wins</p>
      }
    >
      {group.items.map((popup, index) => (
        <PopupRow
          key={popup.id}
          popup={popup}
          rank={index + 1}
          isFirst={index === 0}
          isLast={index === group.items.length - 1}
          {...rowHandlers}
        />
      ))}
    </ListGroup>
  );
};

export default PopupGroup;
