import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
}

export default function SEOHeader({
  title = "Default Title",
  description = "Default description for the website.",
  keywords = "default, keywords, for, seo",
  author = "Your Name",
}: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
