import ServerLayout from '@/components/server/ServerLayout';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('worklist', locale);
  return metadataModule.generate({
    description: t?.('header.desc') || 'PACS Worklist - Query and view radiology studies',
    title: t?.('header.title') || 'Worklist',
    url: '/worklist',
  });
};

const WorklistLayout = ServerLayout({ Desktop, Mobile });

const WorklistPage = async (props: DynamicLayoutProps) => {
  return <WorklistLayout {...props} />;
};

export default WorklistPage;
