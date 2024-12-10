import type { NextPage } from "next";
import Head from "next/head";
import { CreateView } from "views/create";

const Create: NextPage = (props) => {
    return (
        <div>
            <Head>
                <title>BullBear Games | Create </title>
                <meta
                    name="description"
                    content="Create a BullBear Game"
                />
            </Head>
            <CreateView />
        </div>
    );
};

export default Create;
