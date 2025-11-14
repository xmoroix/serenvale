import { ActionIcon, ActionIconProps } from '@lobehub/ui';
import { FlaskConical, Github } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { GITHUB } from '@/const/url';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const ICON_SIZE: ActionIconProps['size'] = {
  blockSize: 36,
  size: 20,
  strokeWidth: 1.5,
};

const BottomActions = memo(() => {
  const { t } = useTranslation('common');

  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);

  return (
    <Flexbox gap={8}>
      {/* Removed GitHub and Labs for radiology system */}
    </Flexbox>
  );
});

export default BottomActions;
