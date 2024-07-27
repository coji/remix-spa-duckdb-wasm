import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui'
interface PanelProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string
}
export const Panel = ({ title, className, children }: PanelProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
