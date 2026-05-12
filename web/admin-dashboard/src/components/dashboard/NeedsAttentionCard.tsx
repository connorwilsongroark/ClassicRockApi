import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NeedsAttentionItem = {
  label: string;
  value: number;
};

type NeedsAttentionCardProps = {
  items: NeedsAttentionItem[];
};

export function NeedsAttentionCard({ items }: NeedsAttentionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs Attention</CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className='text-sm text-muted-foreground'>
            Everything looks good 🎉
          </div>
        ) : (
          <div className='space-y-3'>
            {items.map((item) => (
              <div
                key={item.label}
                className='flex items-center justify-between rounded-md border p-4'
              >
                <div>
                  <div className='font-medium'>{item.label}</div>
                  <div className='text-sm text-muted-foreground'>
                    Records that may need cleanup
                  </div>
                </div>

                <div className='text-2xl font-semibold'>{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
