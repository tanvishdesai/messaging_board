// app/confessions/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Client, Databases } from 'appwrite';
import ShareButton from '@/components/ShareButton';

type Confession = {
  $id: string;
  message: string;
};

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Await params before destructuring its properties
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
    const title = "Campus Confessions: Anonymous Confession";
    const description =
      confession.message.length > 150
        ? confession.message.slice(0, 150) + "..."
        : confession.message;
    const imageUrl =
      process.env.NEXT_PUBLIC_DEFAULT_SHARE_IMAGE ||
      "https://example.com/default-share-image.jpg"; // Use your own fallback image

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

export default async function ConfessionPage({ params }: { params: { id: string } }) {
  // Await params before using its properties
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
  const shareUrl = `http://localhost:3000/confessions/${id}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1f1b2e] via-[#1a1822] to-black text-white p-4">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Anonymous Confession</h1>
        <p className="text-lg mb-6 whitespace-pre-wrap">{confession!.message}</p>
        <ShareButton url={shareUrl} message="Check out this anonymous confession!" />
      </div>
    </main>
  );
}
