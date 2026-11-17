import React from 'react';
import PhoneMockup from './PhoneMockup';
import DesktopMockup from './DesktopMockup';

// App pages show in a phone, web pages in a browser window.
const PageMockup = ({ page, ...rest }) => (page.platform === 'web' ? <DesktopMockup page={page} {...rest} /> : <PhoneMockup page={page} {...rest} />);

export default PageMockup;
