import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function OptionGroup(props: {
  value: string
  options: { text: string, value: string }[]
  onChange: (value: string) => void
}) {
  const { value, options, onChange } = props

  return (
    <RadioGroup className="flex gap-2" value={value} onValueChange={onChange}>
      {options.map(option => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem className="hidden" value={option.value} id={option.value} />
          <Button size="sm" variant={value === option.value ? 'default' : 'outline'} asChild>
            <Label htmlFor={option.value}>
              {option.text}
            </Label>
          </Button>
        </div>
      ))}
    </RadioGroup>
  )
}
