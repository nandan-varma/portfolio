import Link from 'next/link';
import SpringMotion from './components/animation';
import { TextEffect } from '@/components/motion-primitives/text-effect';

const navigation = [
  { name: 'Projects', href: '/projects' },
  { name: 'Contact', href: '/contact' },
];

const IndexPage = () => {
  return (
    <div className="flex flex-col items-center justify-center font-bold w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
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

      <TextEffect per='char' preset='fade' className='z-10 text-4xl cursor-default font-display sm:text-6xl text-white glow'>
        Nandan Varma
      </TextEffect>
      <div className="my-16 text-center">
        <h2 className="text-sm text-zinc-500 ">Software Developer</h2>
      </div>
    </div>
  );
};

export default IndexPage;
