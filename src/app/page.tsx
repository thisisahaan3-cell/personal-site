import { Home } from "@/components/home/Home";
import { resolveMedia } from "@/lib/media.server";
import { PAGES } from "@/lib/pages";

export default function Page() {
  const media = resolveMedia(PAGES.home.media);
  return <Home video={media.video} />;
}
