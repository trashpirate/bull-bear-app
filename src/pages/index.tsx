import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>BullBear Games</title>
        <meta
          name="description"
          content="BullBear Games"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
