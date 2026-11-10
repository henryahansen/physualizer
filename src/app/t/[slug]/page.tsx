import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findTemplate, TEMPLATES } from "@/scene/templates";

// One page per template, built at deploy time so search engines can index it.
export function generateStaticParams() {
  return TEMPLATES.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/t/[slug]">): Promise<Metadata> {
  const template = findTemplate((await params).slug);
  if (!template) return {};
  return { title: template.scene.title, description: template.description };
}

export default async function TemplatePage({ params }: PageProps<"/t/[slug]">) {
  const template = findTemplate((await params).slug);
  if (!template) notFound();

  return (
    <>
      <h1 className="text-2xl">{template.scene.title}</h1>
      <p className="mt-2">{template.description}</p>
      <p className="mt-8">The diagram arrives in milestone M2.</p>
    </>
  );
}
