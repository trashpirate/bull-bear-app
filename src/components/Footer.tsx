import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
export const Footer: FC = () => {
    return (
        <div className="flex">
            <footer className="border-t-2 border-[#141414] bg-black hover:text-white w-screen" >
                <div className="ml-12 py-10 mr-12">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-8 md:space-x-12 relative">
                        <div className='flex flex-col col-span-2 mx-4 items-center md:items-start'>
                            <div className='flex flex-row'>
                                <Link href="https://touchbasedgrass.com" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                                    <div className='flex flex-row ml-1 gap-4'>
                                        <Image
                                            className='w-8 h-8'
                                            src="/grass_logo_transparent.png"
                                            alt="solana icon"
                                            width={512}
                                            height={512}
                                        />
                                        <div className='font-bold text-green-500 text-xl'>TOUCH GRASS</div>
                                    </div>
                                </Link>
                            </div>

                            <div className="my-6 m-1 sm:text-left place-items-start items-start font-normal tracking-tight text-secondary">
                                © 2024 Touch Grasss
                            </div>
                        </div>

                        <div className="items-center mx-auto max-w-screen-lg">
                            <div className="font-normal capitalize mb-2.5">Touch Grass</div>

                            <div className="flex flex-col mb-0 gap-2">
                                <Link href="https://touchbasedgrass.com" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                                    Website
                                </Link>
                                <Link href="https://t.me/TouchBasedGrass" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                                    Telegram
                                </Link>
                                <Link href="https://x.com/TouchBasedGrass" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                                    Twitter
                                </Link>

                            </div>
                        </div>

                        <div className="items-center mx-auto max-w-screen-lg">
                            <h5 className="font-normal capitalize tracking-tight  mb-2.5">DEVELOPERS</h5>

                            <div className="flex flex-col mb-0 gap-2">
                                <Link href="https://github.com/trashpirate/bull-bear" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                                    Code
                                </Link>
                                <Link href="https://docs.solana.com/developers" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                                    Documentation
                                </Link>
                            </div>
                        </div>

                        <div className="items-center mx-auto max-w-screen-lg">
                            <h5 className="font-normal tracking-tight  mb-2.5">ECOSYSTEM</h5>

                            <div className="flex flex-col mb-0 gap-2">
                                <Link href="http://buyholdearn.com" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                                    EARN
                                </Link>
                                <Link href="https://baogoutrx.com/" target="_blank" rel="noopener noreferrer" passHref className="text-secondary hover:text-white">
                                    BAO GOU
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
