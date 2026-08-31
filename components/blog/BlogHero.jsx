import { Search } from "lucide-react";

// Server Component — the search form submits via GET to the same page,
// so the query lands in the URL (?q=...) and the page re-renders server-side
// with results. No client JS needed for this part.
const BlogHero = ({ defaultQuery = "" }) => {
  return (
    <section className="bg-[#0a0a0a] text-white px-6 pt-16 pb-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Our Blog
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase leading-tight mb-4">
            Insights That Inspire{" "}
            <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
              Creativity.
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Tips, trends and tutorials on video editing, motion graphics,
            content creation and growing your brand.
          </p>
        </div>

        <form action="/blog" method="GET" className="w-full lg:w-72">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              name="q"
              defaultValue={defaultQuery}
              placeholder="Search articles..."
              className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default BlogHero;
