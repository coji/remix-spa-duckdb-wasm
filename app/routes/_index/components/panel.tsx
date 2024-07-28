import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui'
interface PanelProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string
  description?: string
}
export const Panel = ({
  title,
  description,
  className,
  children,
}: PanelProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
