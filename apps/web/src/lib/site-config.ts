export function siteConfig() {
  return {
    name: 'Abdulmalik Musba',
    title: process.env.NEXT_PUBLIC_SITE_TITLE ?? 'Abdulmalik Musba — Personal Portfolio',
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
      'Personal portfolio, research, projects, publications, and writing by Abdulmalik Musba.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://abdulmalik-musba.com',
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  } as const;
}