"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const Logo: React.FC = () => {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState('/');

  useEffect(() => {
    // LocalStorage se user data check karein
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Agar user ka role office hai toh dashboard par bhejein, warna / par
        if (parsedUser.role === 'office') {
          setTargetUrl('/admin/dashboard'); // Aap yahan office ka dashboard URL bhi change kar sakte hain agar alag ho
        } else {
          setTargetUrl('/');
        }
      } catch (e) {
        setTargetUrl('/');
      }
    } else {
      setTargetUrl('/');
    }
  }, []);

  return (
    <Link href={targetUrl}>
      <Image
        src="/images/logo/logo-dark.png"
        alt="logo"
        width={125}
        height={50}
        style={{ width: 'auto', height: 'auto' }}
        quality={100}
        className='dark:hidden'
      />
      <Image
        src="/images/logo/logo-white.png"
        alt="logo"
        width={125}
        height={50}
        style={{ width: 'auto', height: 'auto' }}
        quality={100}
        className='dark:block hidden'
      />
    </Link>
  );
};

export default Logo;