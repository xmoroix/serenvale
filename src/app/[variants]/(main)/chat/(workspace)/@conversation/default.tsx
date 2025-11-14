import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import RadiologyBanner from '../../features/RadiologyBanner';
import ReportEditorModal from '../../features/ReportEditorModal';
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
      <ChatInput mobile={isMobile} />
      <ReportEditorModal />
      <ChatHydration />
      <ThreadHydration />
      {!isMobile && <ChatMinimap />}
    </>
  );
};

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
