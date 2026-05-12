import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStatCardProps = {
  label: string;
  value: number;
};

export function DashboardStatCard({ label, value }: DashboardStatCardProps) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className='text-3xl font-semibold'>{value}</div>
      </CardContent>
    </Card>
  );
}
