'use client'

import { usePathname } from 'next/navigation'
import { Table } from 'nextra/components'

export default function FeatureMeta(props: { texts: [string, string, string, string, string] }) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const headerText = getMetaHeaderText(locale)

  const { texts } = props
  const [hasFacadeAPI, hasPaidPlan, needUniverser, nodeJS, preset] = texts

  return (
    <Table className="mt-6">
      <thead>
        <Table.Tr>
          <Table.Th>
            {headerText.facadeAPI}
          </Table.Th>
          <Table.Th>
            {headerText.hasPaidPlan}
          </Table.Th>
          <Table.Th>
            {headerText.needUniverser}
          </Table.Th>
          <Table.Th>
            {headerText.nodeJS}
          </Table.Th>
          <Table.Th>
            {headerText.preset}
          </Table.Th>
        </Table.Tr>
      </thead>
      <tbody>
        <Table.Tr>
          <Table.Td>
            {hasFacadeAPI}
          </Table.Td>
          <Table.Td>
            {hasPaidPlan}
          </Table.Td>
          <Table.Td>
            {needUniverser}
          </Table.Td>
          <Table.Td>
            {nodeJS}
          </Table.Td>
          <Table.Td>
            {preset}
          </Table.Td>
        </Table.Tr>
      </tbody>
    </Table>
  )
}

interface IHeaderTexts {
  facadeAPI?: string
  hasPaidPlan: string
  needUniverser: string
  nodeJS: string
  preset: string
}

function getMetaHeaderText(locale?: string): IHeaderTexts {
  if (locale === 'zh-CN') {
    return {
      facadeAPI: 'Facade API',
      hasPaidPlan: '可付费升级',
      needUniverser: '需要 Univer 服务端',
      nodeJS: 'Univer on Node.js',
      preset: 'Preset',
    }
  }

  return {
    facadeAPI: 'Facade API',
    hasPaidPlan: 'Has Paid Plan',
    needUniverser: 'Univer Server',
    nodeJS: 'Univer on Node.js',
    preset: 'Preset',
  }
}
