import type { NextPage } from "next";
import Head from "next/head";
import { PlayView } from "views/play";

const Play: NextPage = (props) => {
    return (
        <div>
            <Head>
                <title>BullBear Games | Play </title>
                <meta
                    name="description"
                    content="Play a BullBear Game"
                />
            </Head>
            <PlayView />
        </div>
    );
};

export default Play;
