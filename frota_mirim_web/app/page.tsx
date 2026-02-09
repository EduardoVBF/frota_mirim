import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
          Bem-vindo à Frota Mirim!
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Explore o mundo da mobilidade urbana com a Frota Mirim, onde a
          diversão e a sustentabilidade se encontram.
        </p>
      </main>
    </div>
  );
}
