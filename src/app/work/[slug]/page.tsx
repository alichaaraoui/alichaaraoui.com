import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Art } from "@/components/Art";
import { ProjectAside } from "@/components/ProjectAside";
import { ProjectHero } from "@/components/ProjectHero";
import { ProjectRail } from "@/components/ProjectRail";
import { SoundToggle } from "@/components/SoundToggle";
import { projectBySlug, projectDetails, projects } from "@/data/projects";

/** Order in which blocks enter once the opening zoom has landed. */
const step = (n: number) => ({ "--rise-step": n }) as CSSProperties;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return { title: project.title, description: project.blurb };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const details = projectDetails(project);
  const [intro, ...rest] = project.sections;

  // The aside indexes whatever the markdown actually contains, plus the blocks
  // the page always renders.
  const index = [
    ...project.sections.map((s) => ({ id: s.id, title: s.title })),
    ...(project.gallery.length > 0 ? [{ id: "gallery", title: "Gallery" }] : []),
  ];

  // "Next" stays within a discipline this project shares.
  const siblings = projects.filter((p) =>
    p.categories.some((c) => project.categories.includes(c))
  );
  const next =
    siblings[(siblings.findIndex((p) => p.slug === project.slug) + 1) % siblings.length];

  let order = 2;

  return (
    <div className="project-page">
      <ProjectRail />

      <div className="project-grid">
        <ProjectAside
          sections={index}
          eyebrow={`*${project.categories.join(", ")} / ${project.year}`}
          blurb={project.blurb}
          introHtml={intro?.html}
          href={project.href}
          details={details}
        />

        <div className="project-body">
          <section
            id={intro?.id ?? "overview"}
            className="project-head reveal"
            style={step(0)}
          >
            <ProjectHero project={project} />
            <h1 className="project-headline">{project.title}</h1>
          </section>

          {rest.map((s) => (
            <section key={s.id} id={s.id} className="reveal" style={step(order++)}>
              <h2 className="section-head">*{s.title}</h2>
              <div className="prose" dangerouslySetInnerHTML={{ __html: s.html }} />
            </section>
          ))}

          {project.gallery.length > 0 && (
            <section id="gallery" className="reveal" style={step(order++)}>
              <h2 className="section-head">*Gallery</h2>
              <div className="gallery">
                {project.gallery.map((img) => (
                  <div key={img.src} className="gallery-plate">
                    <Art
                      img={img}
                      tone={project.tone}
                      alt=""
                      sizes="(min-width: 768px) 45vw, 90vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {next && next.slug !== project.slug && (
            <section
              id="next"
              className="next-project reveal"
              style={step(order++)}
            >
              <h2 className="section-head">*Next</h2>
              <Link href={`/work/${next.slug}/`} className="next-link">
                <span>{next.title}</span>
                <span className="dimmed">{next.blurb}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </section>
          )}
        </div>
      </div>

      <footer className="project-footer">
        <span>Ali Chaaraoui</span>
        <SoundToggle />
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
