import ProgramDetail from '@/view/ProgramDetail';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <ProgramDetail programEndId={parseInt(params.id)} />;
} 