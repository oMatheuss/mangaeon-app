import type { MostRead } from '@/types/most-read';
import type { Manga, MangaResponse } from './manga';
import type { HighLights } from '@/types/highlights';
import type { Release } from '@/types/releases';
import type {
  Chapter,
  ChaptersWithPagination,
  Manga as ExtractedManga,
} from '@/types/manga';
import type { FeedResponse } from './chapter';
import type { Search } from '@/types/search';
import type { PagesResponse } from './pages';
import type { Images } from '@/types/images';

import { remark } from 'remark';
import html from 'remark-html';

import { type FetchOptions, ResponseType, fetch } from '@tauri-apps/api/http';

const FETCH_OPTIONS: FetchOptions = {
  method: 'GET',
  responseType: ResponseType.JSON,
  headers: { 'User-Agent': 'MangaEon-App/0.1.0' },
};

const BASE_URL = 'https://api.mangadex.org';
const BASE_COVER_URL = 'https://uploads.mangadex.org/covers';

const getReleases = async (page: number) => {
  const url = new URL('/manga', BASE_URL);
  const searchParams = url.searchParams;

  searchParams.append('includes[]', 'cover_art');
  searchParams.append('order[updatedAt]', 'desc');
  searchParams.append('contentRating[]', 'safe');
  searchParams.append('contentRating[]', 'suggestive');
  searchParams.append('availableTranslatedLanguage[]', 'pt-br');
  searchParams.append('availableTranslatedLanguage[]', 'pt');
  searchParams.append('hasAvailableChapters', 'true');
  searchParams.append('limit', '30');
  if (page > 1) {
    searchParams.append('offset', (30 * (page - 1)).toString());
  }

  console.log('here1');
  try {
    const response = await fetch(url.toString(), FETCH_OPTIONS);
    const data = response.data as MangaResponse;
    return data.data.map(extractReleases);
  } catch (err) {
    console.error(err);
  }
};

const extractReleases = (data: Manga) => {
  const id = data.id;
  const title = Object.values(data.attributes.title)[0];

  const coverImage =
    data.relationships.filter((x) => x.type === 'cover_art')[0]?.attributes
      ?.fileName ?? '';
  const cover = `${BASE_COVER_URL}/${id}/${coverImage}.256.jpg`;

  const date = new Date(data.attributes.updatedAt);

  const tags = data.attributes.tags
    .filter((x) => x.type === 'tag')
    .map((x) => x.attributes.name.en)
    .filter(Boolean);

  return <Release>{
    id,
    title,
    cover,
    date,
    tags,
  };
};

const getManga = async (id: string) => {
  const url = new URL('manga', BASE_URL);
  const searchParams = url.searchParams;

  searchParams.append('includes[]', 'cover_art');
  searchParams.append('includes[]', 'artist');
  searchParams.append('includes[]', 'author');
  searchParams.append('ids[]', id);
  searchParams.append('limit', '1');

  searchParams.append('contentRating[]', 'safe');
  searchParams.append('contentRating[]', 'suggestive');
  searchParams.append('contentRating[]', 'erotica');
  searchParams.append('contentRating[]', 'pornographic');

  const response = await fetch(url.toString(), FETCH_OPTIONS);
  const data = response.data as MangaResponse;
  const manga = extractManga(data.data[0]);
  return manga;
};

const extractManga = async (data: Manga) => {
  const langs = 'pt-br,pt,en'.split(',');
  const id = data.id;
  const title = Object.values(data.attributes.title)[0];

  let description = '';
  const descriptionLangs = Object.keys(data.attributes.description);
  for (let lang of langs) {
    if (descriptionLangs.includes(lang)) {
      description = data.attributes.description[lang];
      break;
    }
  }

  const descFromMd = await remark().use(html).process(description);
  const descHtml = descFromMd.toString('utf-8');

  const artist =
    data.relationships.filter((x) => x.type === 'artist')[0]?.attributes
      ?.name ?? '';
  const author =
    data.relationships.filter((x) => x.type === 'author')[0]?.attributes
      ?.name ?? '';

  const coverImage =
    data.relationships.filter((x) => x.type === 'cover_art')[0]?.attributes
      ?.fileName ?? '';
  const cover = `${BASE_COVER_URL}/${id}/${coverImage}.512.jpg`;

  const tags = data.attributes.tags
    .filter((x) => x.type === 'tag')
    .map((x) => x.attributes.name.en)
    .filter(Boolean);

  return <ExtractedManga>{
    id,
    title,
    cover,
    tags,
    description: descHtml,
    artist,
    author,
  };
};

const getChapters = async (id: string, page: number = 0) => {
  const url = new URL(`/manga/${id}/feed`, BASE_URL);
  const searchParams = url.searchParams;

  searchParams.append('translatedLanguage[]', 'pt-br');
  searchParams.append('translatedLanguage[]', 'en');
  searchParams.append('translatedLanguage[]', 'es-la');

  searchParams.append('limit', '96');
  searchParams.append('offset', '0');

  searchParams.append('includes[]', 'scanlation_group');
  searchParams.append('includes[]', 'user');

  searchParams.append('order[volume]', 'desc');
  searchParams.append('order[chapter]', 'desc');

  searchParams.append('contentRating[]', 'safe');
  searchParams.append('contentRating[]', 'suggestive');
  searchParams.append('contentRating[]', 'erotica');
  searchParams.append('contentRating[]', 'pornographic');

  if (page > 1) {
    searchParams.append('offset', (96 * (page - 1)).toString());
  }

  const response = await fetch(url.toString(), FETCH_OPTIONS);
  const data = response.data as FeedResponse;

  return <ChaptersWithPagination>{
    chapters: extractChapters(data.data)
      .filter((x) => x.pages > 0)
      .sort((a, b) => parseFloat(a.number) - parseFloat(b.number))
      .reverse(),
    limit: data.limit,
    offset: data.offset,
    total: data.total,
  };
};

const extractChapters = (data: FeedResponse['data']) => {
  return data.map((chap) => {
    const extracted = <Partial<Chapter>>{
      chapterId: chap.id,
      number: chap.attributes.chapter,
      volume: chap.attributes.volume,
      title: chap.attributes.title,
      publishAt: chap.attributes.publishAt,
      pages: chap.attributes.pages,
      translatedLanguage: chap.attributes.translatedLanguage,
    };

    for (const rel of chap.relationships) {
      switch (rel.type) {
        case 'scanlation_group':
          extracted.scanlator = rel.attributes.name;
          if (rel.attributes.website)
            extracted.scanlatorWebsite = rel.attributes.website;
          else if (rel.attributes.twitter)
            extracted.scanlatorWebsite = `//twitter.com/${rel.attributes.twitter}`;
          else if (rel.attributes.discord) {
            extracted.scanlatorWebsite = `//discord.gg/${rel.attributes.discord}`;
          }
          break;
        case 'manga':
          break;
        case 'user':
          break;
      }
    }

    return extracted as Chapter;
  });
};

const getSearch = async (query: string) => {
  const url = new URL('/manga', BASE_URL);
  const searchParams = url.searchParams;

  searchParams.append('title', query);

  searchParams.append('includes[]', 'cover_art');
  searchParams.append('includes[]', 'author');
  searchParams.append('includes[]', 'artist');
  searchParams.append('order[rating]', 'desc');

  searchParams.append('contentRating[]', 'safe');
  searchParams.append('contentRating[]', 'suggestive');
  searchParams.append('contentRating[]', 'erotica');
  searchParams.append('contentRating[]', 'pornographic');

  searchParams.append('limit', '15');

  const response = await fetch(url.toString(), FETCH_OPTIONS);

  const json = response.data as MangaResponse;
  return json.data.map(extractSearch);
};

const extractSearch = (data: Manga) => {
  const id = data.id;
  const title = Object.values(data.attributes.title)[0];

  const coverImage =
    data.relationships.filter((x) => x.type === 'cover_art')[0]?.attributes
      ?.fileName ?? '';
  const cover = `${BASE_COVER_URL}/${id}/${coverImage}.256.jpg`;

  const artist =
    data.relationships.filter((x) => x.type === 'artist')[0]?.attributes
      ?.name ?? '';
  const author =
    data.relationships.filter((x) => x.type === 'author')[0]?.attributes
      ?.name ?? '';

  const date = new Date(data.attributes.updatedAt);

  const tags = data.attributes.tags
    .filter((x) => x.type === 'tag')
    .map((x) => x.attributes.name.en)
    .filter(Boolean);

  return <Search>{
    id,
    title,
    cover,
    date,
    tags,
    artist,
    author,
  };
};

const getPages = async (id: string) => {
  const url = new URL(`/at-home/server/${id}`, BASE_URL);
  const response = await fetch(url.toString(), FETCH_OPTIONS);
  const data = response.data as PagesResponse;

  return extractPages(data.baseUrl, data.chapter.hash, data.chapter.data);
};

const extractPages = (baseUrl: string, hash: string, files: string[]) => {
  return <Images>{
    baseUrl,
    hash,
    srcs: files.map((file) => {
      return `${baseUrl}/data/${hash}/${file}`;
    }),
  };
};

const getMostRead = async () => {
  const url = new URL('/manga', BASE_URL);
  const searchParams = url.searchParams;

  searchParams.append('includes[]', 'cover_art');
  searchParams.append('order[rating]', 'desc');
  searchParams.append('contentRating[]', 'safe');
  searchParams.append('contentRating[]', 'suggestive');
  searchParams.append('availableTranslatedLanguage[]', 'pt-br');
  searchParams.append('availableTranslatedLanguage[]', 'pt');
  searchParams.append('hasAvailableChapters', 'true');

  const response = await fetch(url.toString(), FETCH_OPTIONS);

  const data = response.data as MangaResponse;
  return data.data.map(extractMostRead);
};

const extractMostRead = (data: Manga) => {
  const langs = 'pt-br,pt,en'.split(',');
  const id = data.id;
  const title = Object.values(data.attributes.title)[0];

  let description = '';
  const descriptionLangs = Object.keys(data.attributes.description);
  for (let lang of langs) {
    if (descriptionLangs.includes(lang)) {
      description = data.attributes.description[lang];
      break;
    }
  }

  const coverImage =
    data.relationships.filter((x) => x.type === 'cover_art')[0]?.attributes
      ?.fileName ?? '';
  const cover = `${BASE_COVER_URL}/${id}/${coverImage}.256.jpg`;

  return <MostRead>{ title, cover, id, description };
};

const getHighLights = async () => {
  const url = new URL('/manga', BASE_URL);
  const searchParams = url.searchParams;

  searchParams.append('includes[]', 'cover_art');
  searchParams.append('order[rating]', 'desc');
  searchParams.append('contentRating[]', 'safe');
  searchParams.append('contentRating[]', 'suggestive');

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  searchParams.append('updatedAtSince', lastMonth.toISOString().slice(0, 19));
  searchParams.append('availableTranslatedLanguage[]', 'pt-br');
  searchParams.append('availableTranslatedLanguage[]', 'pt');
  searchParams.append('limit', '10');
  searchParams.append('hasAvailableChapters', 'true');

  const response = await fetch<MangaResponse>(url.toString(), FETCH_OPTIONS);

  return response.data.data.map(extractHighLights);
};

const extractHighLights = (data: Manga) => {
  const id = data.id;
  const title = Object.values(data.attributes.title)[0];

  const coverImage =
    data.relationships.filter((x) => x.type === 'cover_art')[0]?.attributes
      ?.fileName ?? '';
  const cover = `${BASE_COVER_URL}/${id}/${coverImage}.256.jpg`;

  const date = new Date(data.attributes.updatedAt);

  return <HighLights>{ id, title, cover, date };
};

export const mangadex = {
  mostRead: getMostRead,
  highlights: getHighLights,
  chapters: getChapters,
  manga: getManga,
  pages: getPages,
  releases: getReleases,
  search: getSearch,
};
