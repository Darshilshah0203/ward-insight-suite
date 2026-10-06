import { createFileRoute } from '@tanstack/react-router';
import { WardWorkspace } from '@/components/ward-workspace';
export const Route = createFileRoute('/patients')({
  head: () => ({ meta: [{ title: 'Ward Patients — ClearDay' }, { name: 'description', content: 'The ClearDay ward patient roster, isolation status, and temperature history.' }, { property: 'og:title', content: 'Ward Patients — ClearDay' }, { property: 'og:description', content: 'Review every patient bed and recovery progress in Ward 4.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: () => <WardWorkspace view="patients" />,
});