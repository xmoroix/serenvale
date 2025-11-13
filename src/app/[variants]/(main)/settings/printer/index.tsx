'use client';

import PrinterForm from './features/PrinterForm';

const PrinterSettings = () => {
  return (
    <div style={{ maxWidth: '1024px', width: '100%' }}>
      <PrinterForm />
    </div>
  );
};

PrinterSettings.displayName = 'PrinterSettings';

export default PrinterSettings;
