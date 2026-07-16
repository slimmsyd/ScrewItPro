/**
 * Emits one JSON-LD node as a <script type="application/ld+json">.
 *
 * Server component. Separate scripts per node are fine — consumers merge the
 * page's blocks into one graph by `@id`.
 */
export default function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
