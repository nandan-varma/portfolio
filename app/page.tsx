import Link from 'next/link';
import SpringMotion from './components/animation';

const navigation = [
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '/contact' },
];

const IndexPage = () => {
  return (
    <div className="flex flex-col items-center justify-center font-bold w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      {/* <SpringMotion
        initial={{ y: -1000 }}
        animate={{ y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 15,
          delay: 0.5,
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className="text-white"
      > */}
      <nav className="my-16" aria-label="Main Navigation">
        <ul className="flex items-center justify-center gap-4">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm duration-500 text-zinc-500 hover:text-zinc-300"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* </SpringMotion> */}

      {/* <SpringMotion
        initial={{ x: -1000 }}
        animate={{ x: 0 }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 15,
          delay: 0.1,
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className="font-bold text-white"
      > */}
      <h1 className="z-10 text-4xl cursor-default font-display sm:text-6xl text-white glow">Nandan Varma</h1>
      {/* <SpringMotion
        initial={{ y: 1000 }}
        animate={{ y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 15,
          delay: 0.3,
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1 }}
        className="text-white"
      > */}
      <div className="my-16 text-center">
        <h2 className="text-sm text-zinc-500 ">Software Developer</h2>
      </div>
      {/* </SpringMotion> */}
    </div>
  );
};

export default IndexPage;
