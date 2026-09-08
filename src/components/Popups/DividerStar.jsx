import React from 'react';

// Star 1 from the Figma popup spec (node 163:1809), inlined so it ships with the repo.
const DividerStar = ({ size = 12, color = '#E5E5E5' }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 0L7.62054 4.37946L12 6L7.62054 7.62054L6 12L4.37946 7.62054L0 6L4.37946 4.37946L6 0Z"
      fill={color}
    />
  </svg>
);

export default DividerStar;
