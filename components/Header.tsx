import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-gradient-to-r from-gray-100 to-gray-200 py-5 px-4 border-b border-gray-200 drop-shadow-md">
            <div className="container mx-auto flex items-center justify-center space-x-2">
                {/* Islamic-inspired crescent icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    />
                </svg>
                <Link
                    href="/"
                    className="text-xl md:text-2xl font-bold text-center"
                >
                    USC MSU Ramadan Schedule
                </Link>
            </div>
            <div className="container mx-auto flex justify-center">
                <p className="text-xs text-gray-500">Powered by AMIN @ UCLA</p>
            </div>
        </header>
    );
}
