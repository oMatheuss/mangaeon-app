'use client';

import { ChapterList } from '@/components/chapter-list';
import { mangadex } from '@/lib/api/mangadex/api';
import Image from 'next/image';
import { Pagination } from '@/components/pagination';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

export default function Manga() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const { data: manga } = useQuery({
    queryKey: ['manga', params?.id],
    queryFn: () => mangadex.manga(params?.id),
  });

  let page_str = searchParams.get('page');
  let page = 1;
  if (page_str && !/\d+/.test(page_str)) page = 1;
  else page = page_str ? parseInt(page_str) : 1;

  if (page <= 0 || page * 96 > 10000) return notFound();

  const { data: chapters } = useQuery({
    queryKey: ['manga', params?.id, 'chapters', page],
    queryFn: () => mangadex.chapters(params?.id, page),
  });

  return (
    <div className="flex flex-col">
      <div className="relative items-center mt-6 border-separate">
        <Image
          className="float-none sm:float-left object-cover aspect-[3/4] rounded m-auto mb-6 sm:m-0 sm:mr-3 sm:mb-3"
          src={manga?.cover ?? ''}
          alt={`Imagem de capa de ${manga?.title}`}
          height={256}
          width={192}
        />
        <div className="mb-3">
          <h1 className="sm:mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
            {manga?.title}
          </h1>
          <p className="font-bold text-base-content/70 mb-3">
            {manga?.author}, {manga?.artist}
          </p>
          <div
            className="prose prose-hr:my-3 max-w-full text-justify"
            dangerouslySetInnerHTML={{ __html: manga?.description ?? '' }}
          />
        </div>
      </div>
      <div className="flex flex-row flex-wrap capitalize">
        {manga?.tags.sort().map((tag) => (
          <span
            key={tag}
            className="mr-3 mb-3 text-xs break-keep p-2 rounded bg-neutral text-neutral-content max-w-fit"
          >
            {tag}
          </span>
        ))}
      </div>
      {chapters && (
        <>
          <ChapterList chapters={chapters.chapters} />
          <Pagination
            limit={chapters.limit}
            page={page}
            total={chapters.total}
            offset={chapters.offset}
            mangaId={params.id}
          />
        </>
      )}
    </div>
  );
}
