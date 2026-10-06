import { createFileRoute } from '@tanstack/react-router';
import { WardWorkspace } from '@/components/ward-workspace';
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Morning Round — ClearDay' }, { name: 'description', content: 'ClearDay ward morning round: patient vitals, fever alerts, and three clear days of recovery.' }, { property: 'og:title', content: 'Morning Round — ClearDay' }, { property: 'og:description', content: 'Track the ward round, review patient temperatures, and monitor fever-free recovery.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: () => <WardWorkspace />,
});