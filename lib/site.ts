import type { Metadata } from 'next';

export const SITE_URL = 'https://theolujay.dev';
export const SITE_NAME = 'Olujay';
export const AUTHOR_NAME = 'Joseph Ezekiel';
export const SITE_DESCRIPTION =
  'Joseph Ezekiel is a software engineer writing about backend systems, distributed systems, networking, and the things he learns while building.';

export const DEFAULT_SOCIAL_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Joseph "Olujay" Ezekiel',
};

export function createPageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_NG',
      type: 'website',
      images: [DEFAULT_SOCIAL_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@theolujay',
      images: [DEFAULT_SOCIAL_IMAGE],
    },
  };
}
