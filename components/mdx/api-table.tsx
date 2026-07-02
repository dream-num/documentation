import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'
import { Separator } from '@/components/ui/separator'
import { clsx } from '@/lib/clsx'

interface IParameter {
  name: string
  type: string
  required?: boolean
  description?: string
  example?: string
  properties?: IParameter[]
}

interface IProps {
  request: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    url?: string
    headers?: string | ReactNode
    parametersType?: 'Query' | 'Body' | 'Path'
    parameters?: IParameter[]
    example: string
  }
  response: {
    type: 'application/json'
    parameters?: IParameter[]
    example: string
  }
}

function CodeExample({
  code,
}: {
  code: string
}) {
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-sm">
      <code>{code}</code>
    </pre>
  )
}

function getRequestParametersKey(parametersType: IProps['request']['parametersType']) {
  switch (parametersType) {
    case 'Query':
      return 'api-table.query-parameters'
    case 'Body':
      return 'api-table.body-parameters'
    case 'Path':
      return 'api-table.path-parameters'
    default:
      return 'api-table.no-parameters'
  }
}

function RenderParameters({
  parameters,
  labels,
  indent = 0,
}: {
  parameters: IParameter[]
  labels: {
    description: string
    example: string
    parameter: string
    type: string
  }
  indent?: number
}) {
  return (
    <>
      {parameters.map(param => (
        <Fragment key={[indent, param.name, param.type, param.example].filter(Boolean).join(':')}>
          <tr className="border-b">
            <td className="py-2" style={{ paddingLeft: (indent + 1) * 10 }}>
              <code>{param.name}</code>
              {param.required && (<span className="relative top-1 ml-1 text-red-600">*</span>)}
            </td>
            <td className="py-2"><code>{param.type}</code></td>
            <td className="py-2">{param.example || '-'}</td>
            <td className="py-2">{param.description || '-'}</td>
          </tr>
          {param.properties?.length && (
            <RenderParameters labels={labels} parameters={param.properties} indent={indent + 1} />
          )}
        </Fragment>
      ))}
    </>
  )
}

export function APITable(props: IProps) {
  const t = useTranslations()
  const { request, response } = props
  const requestParameters = t(getRequestParametersKey(request.parametersType))
  const parameterLabels = {
    description: t('api-table.description'),
    example: t('api-table.example'),
    parameter: t('api-table.parameter'),
    type: t('api-table.type'),
  }

  return (
    <div className="grid gap-4">
      {/* Request */}
      <div
        className={`
          grid gap-2 rounded-lg bg-neutral-100 p-2.5 shadow-md
          dark:bg-neutral-800
        `}
      >
        {/* Method */}
        <div className="flex items-center gap-2">
          <span
            className={clsx('font-medium', {
              'text-green-600': request.method === 'GET',
              'text-blue-600': request.method === 'POST',
              'text-red-600': request.method === 'DELETE',
            })}
          >
            {request.method}
          </span>
          {request.url && <span className="font-mono text-sm font-semibold">{request.url}</span>}
        </div>

        {/* Headers */}
        <div className="grid gap-0.5 text-sm">
          <div className="mb-1 font-semibold">{t('api-table.headers')}</div>
          <div>
            {request.headers}
          </div>
        </div>

        <Separator />

        <div className="text-sm font-semibold">
          {requestParameters}
        </div>

        {/* Request Parameters */}
        {request.parameters && (
          <table className="mt-0! mb-4! w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-semibold">{parameterLabels.parameter}</th>
                <th className="text-left font-semibold">{parameterLabels.type}</th>
                <th className="text-left font-semibold">{parameterLabels.example}</th>
                <th className="text-left font-semibold">{parameterLabels.description}</th>
              </tr>
            </thead>
            <tbody>
              <RenderParameters labels={parameterLabels} parameters={request.parameters} />
            </tbody>
          </table>
        )}

        {/* Request Example */}
        {request.example && (
          <CodeExample code={request.example} />
        )}
      </div>

      {/* Response */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">{t('api-table.response')}</div>
          <div className="text-sm font-medium">{response.type}</div>
        </div>

        {/* Response Parameters */}
        {response.parameters && (
          <table className="mt-0! mb-4! w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-semibold">{parameterLabels.parameter}</th>
                <th className="text-left font-semibold">{parameterLabels.type}</th>
                <th className="text-left font-semibold">{parameterLabels.example}</th>
                <th className="text-left font-semibold">{parameterLabels.description}</th>
              </tr>
            </thead>
            <tbody>
              <RenderParameters labels={parameterLabels} parameters={response.parameters} />
            </tbody>
          </table>
        )}

        {/* Response Example */}
        {response.example && (
          <CodeExample code={response.example} />
        )}
      </div>
    </div>
  )
}
