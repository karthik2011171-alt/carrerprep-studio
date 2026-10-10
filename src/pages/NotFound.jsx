import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/common';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="py-10">
      <EmptyState icon={Compass} title="Page not found" text="That address doesn't exist in CareerPrep Studio." action={<Link to="/dashboard"><Button>Back to dashboard</Button></Link>} />
    </div>
  );
}
