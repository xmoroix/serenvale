'use client';

import DoctorForm from './features/DoctorForm';

const DoctorSettings = () => {
  return (
    <div style={{ maxWidth: '1024px', width: '100%' }}>
      <DoctorForm />
    </div>
  );
};

DoctorSettings.displayName = 'DoctorSettings';

export default DoctorSettings;
