# Campus Whispers

A modern, anonymous messaging platform for college campuses that allows students to share their thoughts, ask questions, and connect with their campus community.

## Features

- **Beautiful, Modern UI**: Clean design with a focus on readability and user experience
- **Anonymous or Public Posting**: Users can choose to post anonymously or publicly
- **Category Organization**: Messages can be organized by topics like Academics, Social, Housing, etc.
- **Interactive Engagement**: Like, dislike, and react to posts with emojis
- **Threaded Discussions**: Reply to posts to create meaningful conversations
- **Powerful Filtering**: Sort and filter messages by popularity, recency, or topic
- **Multiple View Modes**: Grid, column, or list view to suit your preference
- **Dark Mode Support**: Easy on the eyes, day or night
- **Responsive Design**: Works beautifully on all devices, from phones to desktops

## Technology Stack

- **Next.js**: React framework for the frontend
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling with utility-first CSS
- **Appwrite**: Backend as a service for authentication and database
- **Heroicons**: Beautiful, hand-crafted SVG icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Appwrite account and project

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/campus-whispers.git
cd campus-whispers
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_AW_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_AW_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_AW_DATABASE_ID=your_appwrite_database_id
NEXT_PUBLIC_AW_COLLECTION_ID=your_appwrite_collection_id
NEXT_PUBLIC_AW_REPLIES_COLLECTION_ID=your_appwrite_replies_collection_id
NEXT_PUBLIC_AW_VOTES_COLLECTION_ID=your_appwrite_votes_collection_id
NEXT_PUBLIC_AW_REACTIONS_COLLECTION_ID=your_appwrite_reactions_collection_id
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
campus-whispers/
├── app/                  # Next.js app directory
│   ├── components/       # Reusable UI components
│   │   ├── CampusComposer.tsx      # Message composition component
│   │   ├── CampusFeed.tsx          # Feed display component
│   │   ├── CampusMessageCard.tsx   # Individual message card component
│   │   ├── CampusModal.tsx         # Modal component
│   │   └── CampusNavbar.tsx        # Navigation component
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── public/               # Static assets
└── ...                   # Configuration files
```

## Customization

### Changing Campus Colors

Edit the CSS variables in `app/globals.css` to match your campus colors:

```css
:root {
  --primary: #3a86ff; /* Main brand color */
  --secondary: #ff006e; /* Secondary color */
  --tertiary: #8338ec; /* Tertiary color */
  /* ... other colors ... */
}
```

### Campus-Specific Features

You can customize the categories in the `CampusFeed.tsx` component to match your campus-specific topics.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from modern social platforms
- Thanks to the Appwrite team for their excellent BaaS
- All the students who provided valuable feedback

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
#   m e s s a g i n g _ b o a r d 
 
 