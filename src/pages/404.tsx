import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" passHref>
        <Button variant="default" size="lg">
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
