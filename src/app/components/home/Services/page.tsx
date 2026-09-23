import Image from "next/image";
import Link from "next/link";

interface ServiceItem {
  title: string;
  description: string;
  image: string;
  link: string; // Lowercase 'l' taake typescript match kar sakay
}

const servicesData: ServiceItem[] = [
  {
    title: "Property Management",
    description: "Comprehensive management services to protect your investment, handle tenants, and maximize rental yields effortlessly.",
    image: "/images/properties/prop-8.jpg",
    link: "/services/property-management"
  },
  {
    title: "Professional Inspection",
    description: "Detailed, thorough property inspections by experts to evaluate structural integrity and uncover hidden issues before you buy or lease.",
    image: "/images/professional-inspection.png",
    link: "/services/professional-inspection"
  },
  {
    title: "Brokerage",
    description: "Expert negotiation and guidance through every step of buying, selling, or leasing commercial and residential properties.",
    image: "/images/Brokerage-Services.jpg",
    link: "/services/brokerage"
  },
  {
    title: "Mortgage",
    description: "Tailored financial solutions and mortgage advisory services to help secure the best rates and seamless loan approvals.",
    image: "/images/mortgage.jpg",
    link: "/services/mortgage"
  },
  {
    title: "Property Listing & Marketing",
    description: "High-exposure digital marketing campaigns, professional photography, and targeted listings to attract serious buyers and tenants fast.",
    image: "/images/property-listing-marketing.png",
    link: "/services/property-listing-marketing"
  },
  {
    title: "After Sales Support",
    description: "Dedicated assistance long after the deal is closed, handling documentation, maintenance transitions, and client queries.",
    image: "/images/after-sales-support.png",
    link: "/services/after-sales-support"
  },
];

export default function Services() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-darkmode transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full mb-3 inline-block">
            Our Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark dark:text-white mb-4">
            Chiron Properties Real Estate Services
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            We offer end-to-end solutions tailored to meet your every real estate need with professionalism, transparency, and excellence.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <Link
              href={service.link}
              key={index}
              className="bg-white dark:bg-semidark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group border border-border dark:border-dark_border cursor-pointer"
            >
              {/* Service Image Container */}
              <div className="relative h-52 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300 z-10" />
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Service Content */}
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Learn More Action */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-dark dark:text-white group-hover:text-primary transition-colors">
                    Explore Service
                  </span>
                  <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-dark dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}