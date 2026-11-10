import Link from "next/link";
import { TEMPLATES } from "@/scene/templates";

// The home page is the template gallery. Thumbnails arrive with the diagram.
export default function GalleryPage() {
  return (
    <>
      <h1 className="text-2xl">Templates</h1>
      <p className="mt-2">Pick a problem, then change the numbers to match yours.</p>
      <ul className="mt-8 space-y-6">
        {TEMPLATES.map((template) => (
          <li key={template.slug}>
            <Link href={`/t/${template.slug}`} className="text-lg">
              {template.scene.title}
            </Link>
            <p>{template.description}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
