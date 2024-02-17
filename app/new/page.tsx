import { product, HeroParallax } from '../components/hero-parallax';

const generateProducts = (titles: string[]): product[] => {
  const baseUrl = "https://";
  const domain = "nandanvarma.com";
  const screenshotsPath = "/screenshots/";

  return titles.map(title => ({
    title,
    link: `${baseUrl}${title.toLowerCase()}.${domain}`,
    thumbnail: `${screenshotsPath}${title.toLowerCase()}.png`,
  }));
};

const IndexPage = () => {
  const titles = ["chat", "prod", "metarics", "band", "chess", "songs", "www", "writing", "pod"];
  const products: product[] = generateProducts(titles);

  return (
    <HeroParallax products={products} />
  );
};

export default IndexPage;
