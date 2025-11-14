import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import OpenReportEditorButton from '../../features/OpenReportEditorButton';
import RadiologyBanner from '../../features/RadiologyBanner';
import ReportEditorController from '../../features/ReportEditorController';
import ChatHydration from './features/ChatHydration';
import ChatInput from './features/ChatInput';
import ChatList from './features/ChatList';
import ChatMinimap from './features/ChatMinimap';
import ThreadHydration from './features/ThreadHydration';
import ZenModeToast from './features/ZenModeToast';

const ChatConversation = async (props: DynamicLayoutProps) => {
  const isMobile = await RouteVariants.getIsMobile(props);

  return (
    <>
      <ZenModeToast />
      <RadiologyBanner />
      <ChatList mobile={isMobile} />
      <OpenReportEditorButton />
      <ChatInput mobile={isMobile} />
      <ReportEditorController />
      <ChatHydration />
      <ThreadHydration />
      {!isMobile && <ChatMinimap />}
    </>
  );
};

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
