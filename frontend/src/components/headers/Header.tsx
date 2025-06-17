import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-10">
            <div className="bg-blue-500 text-white p-4 mx-auto flex items-center justify-between">
                <h1 className="text-3xl font-bold">Toku</h1>
                <nav className="mt-2">
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/" className="transition-colors
                            hover:text-black duration-300
                            ">Home</Link>
                        </li>
                        <li>
                            <Link href="/about" className="transition-colors
                            hover:text-black duration-300
                            ">About</Link>
                        </li>
                        <li>
                            <Link href="/login-page" className="transition-colors
                            hover:text-black duration-300
                            ">Login</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}