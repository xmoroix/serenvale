'use client';

import BrandingForm from './features/BrandingForm';

const BrandingSettings = () => {
  return (
    <div style={{ maxWidth: '1024px', width: '100%' }}>
      <BrandingForm />
    </div>
  );
};

BrandingSettings.displayName = 'BrandingSettings';

export default BrandingSettings;
