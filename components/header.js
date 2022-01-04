import Head from "next/head";

export default function Header({ props }) {
  const { isLoading, room } = props;
  if (isLoading) {
    return (
      <Head>
        <title>WordVault</title>
        <meta property="og:image" content="https://i.imgur.com/NfmSRhc.png" />
        <meta
          property="og:description"
          content="Solve crosswords, collaboratively. Play by yourself, or with up to twenty friends!"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="module"
          src="https://unpkg.com/ionicons@5.2.3/dist/ionicons/ionicons.esm.js"
        ></script>
        <script
          noModule=""
          src="https://unpkg.com/ionicons@5.2.3/dist/ionicons/ionicons.js"
        ></script>
      </Head>
    );
  } else {
    return (
      <Head>
        <title>
          WordVault (
          {room ? room.slice(0, 1).toUpperCase() + room.substring(1) : "?"}{" "}
          room){" "}
        </title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <script
          type="module"
          src="https://unpkg.com/ionicons@5.2.3/dist/ionicons/ionicons.esm.js"
        ></script>
        <script
          noModule=""
          src="https://unpkg.com/ionicons@5.2.3/dist/ionicons/ionicons.js"
        ></script>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap"
          rel="stylesheet"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        ></link>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    );
  }
}
