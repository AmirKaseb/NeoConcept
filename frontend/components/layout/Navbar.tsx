"use client"
import Image from "next/image";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import { Roboto } from "next/font/google";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

const roboto = Roboto({ subsets: ["latin"], weight: ["700"] });

interface IProps {
    elements?: string[];
}

const Navbar = ({}: IProps) => {
    const navItems = [
        {label: "Features", href: "#features"},
        {label: "For Student", href: "#student"},
        {label: "For Instructor", href: "#instructor"},
        {label: "Q&A", href: "#qa"},
        {label: "Accessibility", href: "#accessibility"},

    ];
    return (
        <nav className="bg-gradient-to-r from-[#55ADFF] to-[#666666]  text-white pb-[1px] md:mb-20 mb-10">
            <div className="bg-main">
                <div className="container mx-auto flex justify-between gap-4 items-center pt-5 md:pt-10 pb-2 md:pb-8 px-8 md:px-16">
                    <div className="flex items-center">
                        <Image src="/logo.png" alt="logo" width={60} height={60} />
                        <h1 className={`${roboto.className} font-bold text-3xl font-roboto hidden md:block`}>eoConcept</h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-4">
                        {navItems.map(item => (
                            <Button key={item.label} asChild variant="ghost">
                                <Link href={item.href} className="font-bold text-xl">{item.label}</Link>
                            </Button>
                        ))}
                    </div>

                    <div className="hidden md:flex gap-4">
                        <Button asChild className="bg-[#191F40]/70 p-6">
                            <Link href="/login" className="font-bold text-xl">Login</Link>
                        </Button>
                        <Button asChild className="bg-secondary p-6">
                            <Link href="/register" className="font-bold text-xl">Register</Link>
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-8 w-8 text-white" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mr-4 bg-main border-gray-700 text-white">
                                {navItems.map(item => (
                                    <DropdownMenuItem key={item.label} asChild className="focus:bg-gray-700 focus:text-white">
                                        <Link href={item.href}>{item.label}</Link>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem asChild className="focus:bg-gray-700 focus:text-white">
                                    <Link href="/login">Login</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="focus:bg-gray-700 focus:text-white">
                                    <Link href="/register">Register</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </div>
            </div>
        </nav>
    );
}

export default Navbar;