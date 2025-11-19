import Link from 'next/link'

export function SponsorCard() {
  const sponsor = {
    name: 'Capalyze',
    url: 'https://capalyze.ai/?utm_source=univer',
    image: '/assets/sponsors/capalyze.png',
  }

  return (
    <section className="p-4">
      <Link href={sponsor.url} target="_blank" rel="noreferrer noopener">
        <div
          className="overflow-hidden rounded-lg"
        >
          <img
            className={`
              size-full object-cover
              dark:grayscale-100 dark:invert
            `}
            src={sponsor.image}
            alt={sponsor.name}
          />
        </div>
      </Link>
    </section>
  )
}
