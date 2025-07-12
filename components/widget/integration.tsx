import ImagesReveal from '@/components/animata/images-reveal'
import AppImage from './integration/app.svg'
import DatabaseImage from './integration/database.svg'
import DocumentImage from './integration/document.svg'
import EdiImage from './integration/edi.svg'
import TemplateImage from './integration/template.svg'

interface IProps {
  className?: string
}

export default function Integration(props: IProps) {
  const { className } = props

  const images = [{
    src: AppImage,
    angle: '12deg',
  }, {
    src: DatabaseImage,
    angle: '-18deg',
  }, {
    src: DocumentImage,
    angle: '-5deg',
  }, {
    src: EdiImage,
    angle: '10deg',
  }, {
    src: TemplateImage,
    angle: '-5deg',
  }]

  return (
    <div className={className}>
      <ImagesReveal images={images} />
    </div>
  )
}
