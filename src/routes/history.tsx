import { createFileRoute } from '@tanstack/react-router';
import { WardWorkspace } from '@/components/ward-workspace';
export const Route = createFileRoute('/history')({
  head: () => ({ meta: [{ title: 'Round History — ClearDay' }, { name: 'description', content: 'Review the ClearDay ward daily round completion and fever alert history.' }, { property: 'og:title', content: 'Round History — ClearDay' }, { property: 'og:description', content: 'Daily ward rounds, completed readings, and patient fever alerts.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: () => <WardWorkspace view="history" />,
});