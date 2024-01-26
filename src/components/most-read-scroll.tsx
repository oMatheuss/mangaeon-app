import Link from 'next/link';
import { MostRead } from '@/types/most-read';
import Image from 'next/image';
import { SectionTitle } from '@/components/section-title';

interface Props {
  mostRead?: MostRead[];
}

export const MostReadScroll = ({ mostRead }: Props) => {
  const [firstMostRead, ...mostReadCard] = mostRead ?? [];

  return (
    <>
      <SectionTitle text="Mais Lidos" />
      <div className="flex flex-col lg:flex-row gap-4">
        <MostReadFocusCard item={firstMostRead} />
        <ul className="pb-4 w-full overflow-y-hidden overflow-x-auto grid grid-flow-col auto-cols-max gap-x-3">
          {mostReadCard.map((item) => (
            <MostReadCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </>
  );
};

interface MostReadCardProps {
  item: MostRead;
}

const MostReadCard = ({ item }: MostReadCardProps) => {
  const link = `/manga/${item.id}`;
  return (
    <li className="flex flex-col items-center overflow-hidden rounded-lg shadow-lg bg-base-200 border border-base-content/20">
      <Link href={link}>
        <div className="overflow-hidden rounded-b-lg">
          <Image
            src={item.cover}
            alt={`Image de ${item.title}.`}
            className="w-32 h-48 sm:w-40 sm:h-60 object-cover object-center transition-transform hover:scale-110"
            loading="lazy"
            width={160}
            height={240}
          />
        </div>
      </Link>
      <div className="flex items-center h-16 w-32 sm:w-40 px-2">
        <Link
          href={link}
          className="line-clamp-3 w-full text-xs text-center font-bold tracking-wide hover:text-primary"
        >
          {item.title}
        </Link>
      </div>
    </li>
  );
};

interface MostReadFocusCardProps {
  item?: MostRead;
}

const MostReadFocusCard = ({ item }: MostReadFocusCardProps) => {
  if (!item) return null;

  const link = `/manga/${item.id}`;
  return (
    <section className="mb-4 w-full lg:max-w-screen-lg flex flex-row gap-4 items-center p-4 lg:py-8 overflow-hidden rounded-lg shadow-lg bg-base-200 border border-base-content/20">
      <div className="shrink-0 overflow-hidden dark:shadow-dark-b shadow-md">
        <Link href={link}>
          <Image
            src={item.cover}
            alt={`Image de ${item.title}.`}
            className="w-32 h-48 sm:w-40 sm:h-60 rounded-md shadow-md object-cover object-center"
            loading="eager"
            width={160}
            height={240}
          />
        </Link>
      </div>
      <div className="text-base-content flex flex-col self-start text-left max-h-60">
        <Link className="font-extrabold text-3xl" href={link}>
          <h2 className="hover:underline line-clamp-2">{item.title}</h2>
        </Link>
        <p className="text-sm whitespace-break-spaces text-justify line-clamp-5">
          {item.description}
        </p>
      </div>
    </section>
  );
};
