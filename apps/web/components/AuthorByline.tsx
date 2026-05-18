interface AuthorBylineProps {
  name: string;
  date: string;
  readingTime?: string;
}

export function AuthorByline({ name, date, readingTime }: AuthorBylineProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-semibold text-foreground">
        {name.charAt(0)}
      </div>
      <div>
        <span className="font-medium text-foreground">{name}</span>
        <span className="mx-1.5">·</span>
        <time dateTime={date}>{date}</time>
        {readingTime && (
          <>
            <span className="mx-1.5">·</span>
            <span>{readingTime}</span>
          </>
        )}
      </div>
    </div>
  );
}
