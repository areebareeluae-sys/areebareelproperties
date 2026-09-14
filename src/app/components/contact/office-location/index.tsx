import React from "react";
import Link from "next/link";

const Location = () => {
  const breadcrumbLinks = [
    { href: "/", text: "Home" },
    { href: "/contact", text: "Contact" },
  ];
  return (
    <>
      <section className="bg-primary lg:py-24 py-16 px-4">
        <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md">
            <div className="">
                {/* Pakistan Office */}
                <div className="grid md:grid-cols-6 lg:grid-cols-9 grid-cols-1 gap-7 border-b border-solid border-white border-opacity-50 pb-11">
                    <div className="col-span-3">
                        <h2 className="text-white text-4xl leading-[1.2] font-bold">Pakistan Head Office</h2>
                    </div>
                    <div className="col-span-3">
                        <p className="text-xl text-IceBlue font-normal max-w-64 text-white text-opacity-50"> Punjab ,Lahore, Pakistan</p>
                    </div>
                    <div className="col-span-3 flex flex-col gap-1">
                        <Link href="mailto:info@chironproperties.com" className="text-xl text-white font-medium underline mb-2">info@chironproperties.com</Link>
                        
                        {/* Call Link */}
                        <Link href="tel:+923091000070" className="text-xl text-white text-opacity-80 flex items-center gap-2 hover:text-opacity-100 w-fit">
                            <span className="text-white !text-opacity-40">Call</span>+923091000070
                        </Link>
                        
                        {/* WhatsApp Link */}
                        <a 
                          href="https://wa.me/923091000070" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xl text-[#25D366] font-medium flex items-center gap-2 hover:opacity-80 w-fit mt-1"
                        >
                            <span className="text-white !text-opacity-40">WhatsApp</span>+923091000070
                        </a>
                    </div>
                </div>

                {/* UAE Office */}
                <div className="grid md:grid-cols-6 lg:grid-cols-9 grid-cols-1 gap-7 pt-12">
                    <div className="col-span-3">
                        <h2 className="text-white text-4xl leading-[1.2] font-bold">UAE Office</h2>
                    </div>
                    <div className="col-span-3">
                        <p className="text-xl text-white text-opacity-50 font-normal max-w-64"> Chiron Properties dubai United Arab Emirates (UAE)</p>
                    </div>
                    <div className="col-span-3 flex flex-col gap-1">
                        <Link href="mailto:info@chironproperties.com" className="text-xl text-white font-medium underline mb-2">info@chironproperties.com</Link>
                        
                        {/* Call Link */}
                        <Link href="tel:+971902536515" className="text-xl text-white text-opacity-80 flex items-center gap-2 hover:text-opacity-100 w-fit">
                            <span className="text-white !text-opacity-40">Call</span>+971902536515
                        </Link>
                        
                        {/* WhatsApp Link */}
                        <a 
                          href="https://wa.me/971902536515" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xl text-[#25D366] font-medium flex items-center gap-2 hover:opacity-80 w-fit mt-1"
                        >
                            <span className="text-white !text-opacity-40">WhatsApp</span>+971902536515
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </>
  );
};

export default Location;