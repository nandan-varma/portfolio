import { LinkProps } from "next/link";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface NavbarLinkProps extends LinkProps {
    children: React.ReactNode;
    href: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const NavbarLink = ({ children, href }: NavbarLinkProps) => {
    const router = useRouter();
    return (
        <motion.div
            whileHover={
                { scale: 1.5 }
            }>
            <Link
                onClick={async (e) => {
                    e.preventDefault();
                    document.querySelector('body')?.classList.add('page-transition');
                    await sleep(500);
                    router.push(href);
                    await sleep(500);
                    document.querySelector('body')?.classList.remove('page-transition');
                }}
                href={href}
                className="duration-500 text-zinc-500 hover:text-zinc-300 text-md"
            >
                {children}
            </Link>
        </motion.div>
    );
}