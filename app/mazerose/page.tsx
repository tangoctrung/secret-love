import MazeRose from '@/components/MazeRose'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "MazeRose",
  description: "Mê cung hoa hồng",
  openGraph: {
    title: "MazeRose | Memory",
    description: "Mê cung hoa hồng",
    images: [
      {
        url: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c1d0b6bc-ae1d-4726-b675-584df71031cb/dfe28d9-ef46b0d9-e3b1-4c6f-88db-09f242879f32.png/v1/fit/w_512,h_512,q_70,strp/rose_maze_2__by_youvebeen0wned_dfe28d9-375w-2x.jpg',
        width: 800,
        height: 600,
      },
    ],
  },
};

function MazeRosePage() {
  return (
    <div>
      <MazeRose />
    </div>
  )
}

export default MazeRosePage