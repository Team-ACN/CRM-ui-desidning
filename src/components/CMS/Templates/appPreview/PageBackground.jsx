import React from 'react';
import homeBg from '../../../../assets/appPreview/HomeBg.svg';
import propertiesBg from '../../../../assets/appPreview/PropertiesBg.jpg';
import servicesBg from '../../../../assets/appPreview/ServicesBg.png';

import { PAGE_TINTS } from './constants';

/**
 * Header art that sits behind the app header and scrolls away with the page.
 * `color` (e.g. the Top Banner colour) overrides the default tint.
 */
const PageBackground = ({ page = 'home', color, scrollY = 0 }) => {
  const tint = color || PAGE_TINTS[page] || PAGE_TINTS.home;
  const style = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 444,
    overflow: 'hidden',
    pointerEvents: 'none',
    transform: `translateY(${-scrollY}px)`,
    background: page === 'home' ? `linear-gradient(180deg, ${tint}, ${tint}E6)` : tint,
  };
  return (
    <div style={style}>
      {page === 'home' && <img src={homeBg} alt="" style={{ width: '115%', maxWidth: 'none', marginLeft: '-7%' }} />}
      {page === 'properties' && <img src={propertiesBg} alt="" style={{ width: '100%', opacity: 0.4 }} />}
      {page === 'services' && <img src={servicesBg} alt="" style={{ width: '100%' }} />}
    </div>
  );
};

export default PageBackground;
