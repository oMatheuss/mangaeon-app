'use client';

import { FeaturedScroll } from '@/components/featured-scroll';
import { MostReadScroll } from '@/components/most-read-scroll';
import { Releases } from '@/components/releases';
import { SearchBar } from '@/components/search-bar';
import { mangadex } from '@/lib/api/mangadex/api';
import { useQueries } from '@tanstack/react-query';
import { ArrowRightCircle } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [{ data: highlights }, { data: releases }, { data: mostRead }] =
    useQueries({
      queries: [
        {
          queryKey: ['highlights'],
          queryFn: () => mangadex.highlights(),
        },
        {
          queryKey: ['releases', 1],
          queryFn: () => mangadex.releases(1),
        },
        {
          queryKey: ['mostRead'],
          queryFn: () => mangadex.mostRead(),
        },
      ],
    });

  return (
    <div className="flex flex-col my-3">
      <SearchBar />
      <FeaturedScroll highlights={highlights} />
      <MostReadScroll mostRead={mostRead} />
      <Releases releases={releases} />
      <NextPageButton />
    </div>
  );
}

const NextPageButton = () => (
  <div className="flex justify-center mt-3">
    <Link
      href="/lancamentos/2"
      className="group w-32 max-w-full h-10 flex items-center justify-center rounded bg-primary hover:bg-primary-focus"
    >
      <ArrowRightCircle
        aria-label="Proxima página"
        className="w-6 h-6 stroke-primary-content"
      />
    </Link>
  </div>
);
