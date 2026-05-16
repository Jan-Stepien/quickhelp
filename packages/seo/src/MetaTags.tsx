import React from "react";

interface MetaTagsProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

export function MetaTags({ title, description, url, imageUrl }: MetaTagsProps) {
  const fullTitle = `${title} | quickhelp.dev`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
