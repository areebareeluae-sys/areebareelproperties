"use client";
import { useState } from "react";
import Loader from "../../shared/Loader";
import { useRouter } from "next/navigation";
import Logo from "../../layout/header/logo";

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [loader, setLoader] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !phone.trim() || !newPassword.trim()) {
            setError("Fill all the fields");
            return;
        }

        if (newPassword.length < 8) {
            setError("8 characters minimum");
            return;
        }

        setLoader(true);
        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, phone, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'invalid Email and Number');
                setLoader(false);
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/signin");
            }, 2000);
        } catch (err) {
            console.error(err);
            setError("Server Busy");
        } finally {
            setLoader(false);
        }
    };

    return (
        
            <div className="max-w-md w-full bg-white dark:bg-semidark px-8 py-12 sm:px-10 rounded-xl  text-left">
                <div className="flex flex-col items-center mb-8">
                    <div className="max-w-[140px] w-full mb-3 flex justify-center">
                        <Logo />
                    </div>
                    <h2 className="text-2xl font-bold text-dark dark:text-white">
                        Forgot Your Password?
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-white/60 mt-1 text-center">
                        Enter your registered Email and Phone number to reset your password.
                    </p>
                </div>

                {isSuccess ? (
                    <div className="flex flex-col items-center gap-2 py-6">
                        <p className="text-base text-green-600 dark:text-green-400 font-medium text-center">
                            Change Password successful! Redirecting to signin...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="text-left">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none transition placeholder:text-gray-400 focus:border-black dark:focus:border-white"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                placeholder="+1234567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none transition placeholder:text-gray-400 focus:border-black dark:focus:border-white"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                                New Password (Min 8 characters)
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full rounded-md border border-border dark:border-dark_border bg-transparent px-4 py-3 text-base text-dark dark:text-white outline-none transition placeholder:text-gray-400 focus:border-black dark:focus:border-white"
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loader}
                                className="flex w-full cursor-pointer items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black hover:opacity-90 px-5 py-3 text-base transition duration-300 ease-in-out font-medium shadow-md"
                            >
                                {loader ? <Loader /> : "Reset Password Chiron"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
       
    );
};

export default ForgotPassword;