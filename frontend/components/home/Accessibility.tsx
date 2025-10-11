"use client"
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";

import Link from "next/link";
import Image from "next/image";
import {motion} from "framer-motion";
import {FaAppStoreIos} from "react-icons/fa";
import {IoLogoGooglePlaystore} from "react-icons/io5";
import {FaApple} from "react-icons/fa";

const Accessibility = () => {
    return (
    <Card className="border-none text-white mb-8 overflow-hidden max-w-6xl mx-auto">
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: .6, delay: 0.5 }}
        >
            {/* Grid layout لتقسيم البطاقة إلى قسمين: نص ورسم بياني */}
            <div className="grid grid-cols-1 lg:grid-cols-2">


                <div className="flex flex-col justify-center p-8 md:p-12 order-last lg:order-first">
                    <CardHeader className="p-0 mb-8 space-y-2">
                        <CardTitle className="w-full text-4xl font-bold tracking-wide text-white pb-2">
                            Download The <br />
                            <span className={"bg-gradient-to-r from-[#7DC9FF] to-[#C46AF8] bg-clip-text text-transparent"}>
                                Smart E-Learning App
                            </span>
                        </CardTitle>
                        {/* خط تحت العنوان - باستخدام div عادي بدلاً من CardDescription لتصميم الخط السميك */}

                    </CardHeader>

                    {/* محتوى البطاقة - قائمة الميزات */}
                    <CardContent className="p-0 space-y-6  text-xl font-bold">
                        get our App For Free and enjoy courses, personalized learing , etc
                        <br />
                        anywhere, anytime
                    </CardContent>


                    <CardFooter className="flex flex-col gap-3 items-start justify-between mt-10 -ml-6">
                        <div className={"bg-gradient-to-r from-[#7BAFFE] to-[#B854FA] p-[2px] rounded w-85"}>
                            <Link href={"/"}>
                            <Button className={"w-full bg-[#191F40] rounded py-8 text-2xl"}>
                                <div className={"w-full flex gap-2 justify-start items-center"}><IoLogoGooglePlaystore className={"text-white size-7.5"}/> <span>Download For Android</span></div>
                            </Button>
                            </Link>
                        </div>
                        <div className={"bg-gradient-to-r from-[#7BAFFE] to-[#B854FA] p-[2px] rounded w-85"}>
                            <Link href={"/"}>
                            <Button className={"w-full bg-[#191F40] rounded py-8 text-2xl"}>
                                <div className={"w-full flex justify-start gap-2 items-center"}><FaAppStoreIos className={"text-white size-7.5"}/> <span>Download For IOS</span></div>
                            </Button>
                            </Link>
                        </div>
                    </CardFooter>
                </div>

                {/* === القسم الأيمن: الرسم البياني التوضيحي (Placeholder) === */}
                {/* هذا القسم يستخدم flexbox لمحاكاة الجانب الرسومي المضيء */}
                <div className="relative flex items-center justify-center p-4">
                    <div
                        className="w-full h-full min-h-[400px] rounded-xl flex items-center justify-center p-8 lg:p-12"

                    >
                        <Image alt={"student"} src={"/phone.png"} width={500} height={500} />
                    </div>
                </div>

            </div>
        </motion.div>
    </Card>
    );
}
// @ts-ignore
export default Accessibility;