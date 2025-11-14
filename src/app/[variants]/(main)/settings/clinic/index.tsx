'use client';

import ClinicForm from './features/ClinicForm';

const ClinicSettings = () => {
  return (
    <div style={{ maxWidth: '1024px', width: '100%' }}>
      <ClinicForm />
    </div>
  );
};

ClinicSettings.displayName = 'ClinicSettings';

export default ClinicSettings;
