import React, { FC } from "react";
import Breadcrumb from "../../breadcrumb";
import { BreadcrumbLink } from "@/app/types/data/breadcrumb";

interface HeroSubProps {
    title: string;
    description: string;
    breadcrumbLinks: BreadcrumbLink[];
    bgImage?: string; // Optional: agar kisi page par alag image deni ho
}

const HeroSub: FC<HeroSubProps> = ({ 
    title, 
    description, 
    bgImage = "/images/hero/pexels-maria-charizani-3542905-5577693.jpg" // Default property background image
}) => {
    return (
        <>
            <section 
                className="text-center bg-cover bg-center bg-no-repeat mt-5 pt-36 pb-20 relative "
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                {/* Dark/Light Gradient Overlay taake text high contrast aur readable rahe */}
                <div className="absolute inset-0 bg-gradient-to-b  dark:from-darkmode/95 dark:via-darkmode/90 dark:to-darklight/95 z-0"></div>

                {/* Content Container */}
                <div className="relative z-10 container mx-auto px-4">
                    <h2 className="text-midnight_text text-[50px] leading-[1.2] font-bold text-white dark:text-white capitalize">
                        {title}
                    </h2>
                </div>
            </section>
        </>
    );
};

export default HeroSub;