// in px units
const breakpointSizes = {
  mobileXS: '0' /* smallest phones like galaxy fold */,
  mobileSM: '320px' /* small phones */,
  mobile: '414px' /* newest large phones */,
  tablet: '768px' /* tablet */,
  tabletXL: '900px',
  desktop: '992px' /* small desktop */,
  desktopXL: '1370px' /* large desktop */,
};

const device = {
  mobileXS: `(max-width: ${breakpointSizes.mobileXS})`,
  mobileSM: `(max-width: ${breakpointSizes.mobileSM})`,
  mobile: `(max-width: ${breakpointSizes.mobile})`,
  tablet: `(max-width: ${breakpointSizes.tablet})`,
  tabletXL: `(max-width: ${breakpointSizes.tabletXL})`,
  desktop: `(max-width: ${breakpointSizes.desktop})`,
  desktopXL: `(max-width: ${breakpointSizes.desktopXL})`,
};

const customBreakpoints = Object.freeze({
  breakpointSizes,
  device,
});

export default customBreakpoints;
