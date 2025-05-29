import { Footer } from 'nextra-theme-docs'

export default function Copyright() {
  const currentYear = new Date().getFullYear()

  return (
    <Footer>
      <span className="text-sm">
        Copyright &copy; 2023-
        {currentYear}
        {' '}
        DreamNum Co., Ltd. All Rights Reserved.
      </span>
    </Footer>
  )
}
