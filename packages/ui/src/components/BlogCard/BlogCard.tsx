import {
  BLOG_CARD_BODY_CLASS,
  BLOG_CARD_CATEGORY_CLASS,
  BLOG_CARD_CLASS,
  BLOG_CARD_EXCERPT_CLASS,
  BLOG_CARD_MEDIA_CLASS,
  BLOG_CARD_META_CLASS,
  BLOG_CARD_TITLE_CLASS,
  type BlogCardProps,
} from "./BlogCard.types";

/**
 * Butterfly BlogCard — placeholder editorial preview.
 */
export function BlogCard({
  title,
  excerpt,
  category,
  readingTime,
  href = "#",
  className,
}: BlogCardProps) {
  const classNames = [BLOG_CARD_CLASS, className].filter(Boolean).join(" ");

  return (
    <article className={classNames}>
      <div className={BLOG_CARD_MEDIA_CLASS} aria-hidden="true" />
      <div className={BLOG_CARD_BODY_CLASS}>
        {category ? (
          <p className={BLOG_CARD_CATEGORY_CLASS}>{category}</p>
        ) : null}
        <h3 className={BLOG_CARD_TITLE_CLASS}>
          <a href={href}>{title}</a>
        </h3>
        <p className={BLOG_CARD_EXCERPT_CLASS}>{excerpt}</p>
        {readingTime ? (
          <p className={BLOG_CARD_META_CLASS}>{readingTime}</p>
        ) : null}
      </div>
    </article>
  );
}
