import type { HighLights } from '@/types/highlights';
import { FeaturedCard } from './featured-card';

interface Props {
  highlights?: HighLights[];
}

export function FeaturedScroll({ highlights }: Props) {
  return (
    <ul className="w-full h-64 flex snap-x snap-mandatory overflow-x-auto bg-inherit border border-base-content/20 rounded-lg shadow-lg">
      {highlights?.map((hl) => <FeaturedCard key={hl.id} item={hl} />)}
    </ul>
  );
}
