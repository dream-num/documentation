// Image
export interface IluckyImage {
  border: IluckyImageBorder
  crop: IluckyImageCrop
  default: IluckyImageDefault

  fixedLeft: number
  fixedTop: number
  isFixedPos: boolean
  originHeight: number
  originWidth: number
  src: string
  type: string
}

export interface IluckyImageBorder {
  color: string
  radius: string | number
  style: string
  width: number
}

export interface IluckyImageCrop {
  height: number
  offsetLeft: number
  offsetTop: number
  width: number
}

export interface IluckyImageDefault {
  height: number
  left: number
  top: number
  width: number
}

export interface IluckyImages {
  [index: string]: IluckyImage
}
