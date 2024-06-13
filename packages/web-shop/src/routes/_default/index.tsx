import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_default/')({
  component: () => {
    return <div>hello, this is the web shop</div>;
  },
});
