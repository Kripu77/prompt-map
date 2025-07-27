
export { useMindmapStore, mindmapSelectors } from './mindmap-store';
export { useSidebarStore, sidebarSelectors } from './sidebar-store';
export { useThreadsStore, threadsSelectors } from './threads-store';


export type {
  MindmapStore,
  SidebarStore,
  ThreadsStore,
  PromptHistoryItem,
} from '@/types/store';



import { useMindmapStore } from './mindmap-store';
import { useSidebarStore } from './sidebar-store';
import { useThreadsStore } from './threads-store';


export const resetAllStores = () => {
  useMindmapStore.getState().reset();
  useSidebarStore.getState().reset();
  useThreadsStore.getState().reset();
};


export const getAppState = () => ({
  mindmap: useMindmapStore.getState(),
  sidebar: useSidebarStore.getState(),
  threads: useThreadsStore.getState(),
});


export const subscribeToAllStores = (callback: (state: ReturnType<typeof getAppState>) => void) => {
  const unsubscribeMindmap = useMindmapStore.subscribe(() => callback(getAppState()));
  const unsubscribeSidebar = useSidebarStore.subscribe(() => callback(getAppState()));
  const unsubscribeThreads = useThreadsStore.subscribe(() => callback(getAppState()));
  
  return () => {
    unsubscribeMindmap();
    unsubscribeSidebar();
    unsubscribeThreads();
  };
};