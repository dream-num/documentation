export interface ILuckyInlineStrItem {
  ff: string | number | undefined// fontfamily,
  fc: string | undefined// fontcolor
  bl: number | undefined// Bold
  it: number | undefined// italic
  fs: string | number | undefined// font size
  cl: number | undefined// Cancelline, 0 Regular, 1 Cancelline
  un: number | undefined// underline, 0 Regular, 1 underlines, fonts
  v: string | number | boolean | undefined // Original value
}
