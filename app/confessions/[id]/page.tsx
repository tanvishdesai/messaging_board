import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Client, Databases } from 'appwrite';
import ShareButton from '@/components/ShareButton';

type Confession = {
  $id: string;
  message: string;
};

type ParamsType = { id: string };

/**
 * We type `params` as a Promise<ParamsType> to satisfy Next.js’s PageProps type.
 * At runtime, if Next.js supplies a plain object, Promise.resolve() will wrap it.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<ParamsType>;
}): Promise<Metadata> {
  const { id } = await params;

  // Initialize the Appwrite client and databases
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
  const databases = new Databases(client);

  try {
    // Fetch the confession document using the dynamic id
    const confessionResponse = await databases.getDocument(
      process.env.NEXT_PUBLIC_AW_DATABASE_ID!,
      process.env.NEXT_PUBLIC_AW_COLLECTION_ID!,
      id
    );
    const confession = confessionResponse as unknown as Confession;

    // Create dynamic metadata using the confession details
    const title = 'Campus Confessions: Anonymous Confession';
    const description =
      confession.message.length > 150
        ? confession.message.slice(0, 150) + '...'
        : confession.message;
    const imageUrl =
      process.env.NEXT_PUBLIC_DEFAULT_SHARE_IMAGE ||
      'https://example.com/default-share-image.jpg';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://yourdomain.com/confessions/${id}`,
        siteName: 'Campus Confessions',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: 'Campus Confessions',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    // Fallback metadata in case of error (e.g., confession not found)
    return {
      title: 'Confession Not Found',
      description: 'This confession does not exist.',
    };
  }
}

export default async function ConfessionPage({
  params,
}: {
  params: Promise<ParamsType>;
}) {
  const { id } = await params;

  // Initialize the Appwrite client and databases
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_AW_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_AW_PROJECT_ID!);
  const databases = new Databases(client);

  let confession: Confession | null = null;
  try {
    const confessionResponse = await databases.getDocument(
      process.env.NEXT_PUBLIC_AW_DATABASE_ID!,
      process.env.NEXT_PUBLIC_AW_COLLECTION_ID!,
      id
    );
    confession = confessionResponse as unknown as Confession;
  } catch {
    // If the confession isn’t found, trigger Next.js’s notFound helper
    notFound();
  }

  // Construct the shareable URL
  const shareUrl = `https://yourdomain.com/confessions/${id}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1f1b2e] via-[#1a1822] to-black text-white p-4">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-lg shadow-xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
          Anonymous Confession
        </h1>
        <p className="text-lg mb-6 whitespace-pre-wrap">
          {confession!.message}
        </p>
        <ShareButton
          url={shareUrl}
          message="Check out this anonymous confession!"
        />
      </div>
    </main>
  );
}
