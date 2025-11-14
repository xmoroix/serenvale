'use client';

import PACSForm from './features/PACSForm';

const PACSSettings = () => {
  return (
    <div style={{ maxWidth: '1024px', width: '100%' }}>
      <PACSForm />
    </div>
  );
};

PACSSettings.displayName = 'PACSSettings';

export default PACSSettings;
