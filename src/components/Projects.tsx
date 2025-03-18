import { Card } from "./Card";
import { Article } from "./Article";
import type { Project } from "../content.config";

import "../styles/global.css";

export default function Projects({ projects }: { projects: Project[] }) {

    const featured = projects.find((project) => project.title === "Friday");
    const top2 = projects.find((project) => project.title === "Productivity");
    const top3 = projects.find((project) => project.title === "Chess Online");

    const sorted = projects.sort((a, b) => {
        if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return 0;
    });


    return (
        <div className="relative pb-16">
        {/* <Navigation /> */}
        <div className="px-6 pt-16 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
            <div className="max-w-2xl mx-auto lg:mx-0">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                    Projects
                </h2>
                {/* <p className="mt-4 text-zinc-400">
                    Some of the projects are from work and some are on my own time.
                </p> */}
            </div>
            <div className="w-full h-px bg-zinc-800" />

            <div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-2 ">
                <Card>
                    <a className="" href={`/project/${featured?.title}`}>
                        <article className="relative h-full w-full p-4 md:p-8" tabIndex={-1}>
                            <div className="flex justify-between gap-2 items-center">
                                <div className="text-xs text-zinc-100">
                                    {featured?.date ? (
                                        <time dateTime={new Date(featured?.date).toISOString()}>
                                            {Intl.DateTimeFormat(undefined, {
                                                dateStyle: "medium",
                                            }).format(new Date(featured?.date))}
                                        </time>
                                    ) : (
                                        <span>SOON</span>
                                    )}
                                </div>
                            </div>

                            <h2
                                id="featured?-post"
                                className="mt-4 text-3xl font-bold  text-zinc-100 group-hover:text-white sm:text-4xl font-display"
                            >
                                {featured?.title}
                            </h2>
                            <p className="mt-4 leading-8 duration-150 text-zinc-400 group-hover:text-zinc-300">
                                {featured?.description}
                            </p>
                            <div className="absolute bottom-4 md:bottom-8">
                                <p className="text-zinc-200 hover:text-zinc-50 hidden lg:block">
                                    Read more <span aria-hidden="true">&rarr;</span>
                                </p>
                            </div>
                        </article>
                    </a>
                </Card>

                <div className="flex flex-col w-full gap-8  mx-auto border-t border-gray-900/10  lg:mx-0  lg:border-t-0 ">
                    {[top2, top3].filter(project => project !== undefined).map((project) => (
                        <Card key={project.title}>
                            <Article project={project} views={0} />
                        </Card>
                    ))}
                </div>
            </div>
            <div className="hidden w-full h-px md:block bg-zinc-800" />

            <div className="grid  grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
                <div className="grid grid-cols-1 gap-4">
                    {sorted
                        .filter((_, i) => i % 3 === 0)
                        .map((project, index) => (
                            <Card key={project.title}>
                                <Article project={project} views={0} />
                            </Card>
                        ))}
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {sorted
                        .filter((_, i) => i % 3 === 1)
                        .map((project) => (
                            <Card key={project.title}>
                                <Article project={project} views={0} />
                            </Card>
                        ))}
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {sorted
                        .filter((_, i) => i % 3 === 2)
                        .map((project) => (
                            <Card key={project.title}>
                                <Article project={project} views={0} />
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    </div>
    );
}