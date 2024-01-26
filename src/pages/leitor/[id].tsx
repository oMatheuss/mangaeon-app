'use client';

import { AddViewed } from '@/components/add-viewed';
import { Paginas } from '@/components/paginas';
import { mangadex } from '@/lib/api/mangadex/api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function Leitor() {
  const params = useParams() as { id: string };

  const { data: images, isError } = useQuery({
    queryKey: ['images', params?.id],
    queryFn: () => mangadex.pages(params?.id),
  });

  return (
    <div className="flex flex-col items-center mb-3">
      <AddViewed id={params?.id} />
      {images && <Paginas images={images.srcs} />}
    </div>
  );
}
