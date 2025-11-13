import ServerLayout from '@/components/server/ServerLayout';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('reports', locale);
  return metadataModule.generate({
    description: t?.('header.desc') || 'Finished radiology reports',
    title: t?.('header.title') || 'Reports',
    url: '/reports',
  });
};

const ReportsLayout = ServerLayout({ Desktop, Mobile });

const ReportsPage = async (props: DynamicLayoutProps) => {
  return <ReportsLayout {...props} />;
};

export default ReportsPage;
