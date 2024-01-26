'use client';

import { Releases } from '@/components/releases';
import { mangadex } from '@/lib/api/mangadex/api';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

export default function Lancamentos() {
  const params = useParams<{ page: string }>();

  const page = parseInt(params?.page);

  const { data: releases } = useQuery({
    queryKey: ['releases', params?.page],
    queryFn: () => mangadex.releases(page),
  });

  return (
    <>
      {releases && <Releases releases={releases} />}
      <section className="flex mt-3 justify-between">
        <Link
          href={`${page - 1}`}
          data-visible={page > 1}
          className="data-[visible=false]:hidden group w-10 h-10 flex items-center justify-center rounded hover:bg-base-content/10"
        >
          <ArrowLeftCircle
            aria-label="Página anterior"
            className="w-6 h-6 group-hover:stroke-primary-focus"
          />
        </Link>
        <Link
          href={`${page + 1}`}
          className="group w-10 h-10 flex items-center justify-center rounded hover:bg-base-content/10"
        >
          <ArrowRightCircle
            aria-label="Proxima página"
            className="w-6 h-6 group-hover:stroke-primary-focus"
          />
        </Link>
      </section>
    </>
  );
}
