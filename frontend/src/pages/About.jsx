import { FaSeedling, FaHandsHelping, FaGem } from "react-icons/fa";

const values = [
  { icon: FaSeedling, title: "Sourced with intention", desc: "We work directly with small manufacturers who share our standards for materials and labor practices." },
  { icon: FaGem, title: "Made to be used", desc: "Every product on Aurelia earns its place through everyday utility, not just good photography." },
  { icon: FaHandsHelping, title: "Support that shows up", desc: "Real people answer your emails, and we stand behind every order with easy returns." },
];

export default function About() {
  return (
    <div>
      <section className="bg-ink text-paper">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-24 text-center">
          <p className="text-brass text-xs tracking-[0.3em] uppercase mb-4">Our Story</p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-6">
            We started Aurelia because good design shouldn't be rare.
          </h1>
          <p className="text-paper/60 max-w-2xl mx-auto leading-relaxed">
            Founded in 2021, Aurelia began as a small collection of home goods sourced from independent workshops.
            Today we work with over 40 makers across the country to bring considered, well-made products to your
            door — without the markup of traditional retail.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 py-20 grid md:grid-cols-3 gap-10">
        {values.map((v, i) => (
          <div key={i} className="text-center">
            <div className="w-14 h-14 rounded-full bg-mist flex items-center justify-center mx-auto mb-5">
              <v.icon className="text-brass" size={22} />
            </div>
            <h3 className="font-display text-lg mb-2">{v.title}</h3>
            <p className="text-sm text-ink/60 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-white border-y border-mist">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-mist">
            <img
              src="https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?q=80&w=1000&auto=format&fit=crop"
              alt="A maker's workshop with tools and raw materials"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="section-eyebrow mb-2">Behind the scenes</p>
            <h2 className="font-display text-2xl md:text-3xl mb-4">From workshop to your doorstep</h2>
            <p className="text-ink/60 leading-relaxed mb-4">
              Each product is inspected by hand before it ships. We keep our supply chain short and our packaging
              minimal — because the best sustainability practice is simply making things that last.
            </p>
            <p className="text-ink/60 leading-relaxed">
              Have a question about where something comes from? Our team can walk you through the maker, the
              materials, and the process. Just write to us at support@aurelia.store.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 md:px-8 py-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl mb-4">Join over 12,000 happy customers</h2>
        <p className="text-ink/60 mb-8">Explore the current collection and see what everyone is talking about.</p>
        <a href="/products" className="btn-primary inline-block">Shop now</a>
      </section>
    </div>
  );
}
