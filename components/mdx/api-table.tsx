import type { ReactNode } from 'react'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { Fragment, useMemo } from 'react'
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

function RenderParameters({
  parameters,
  indent = 0,
}: {
  parameters: IParameter[]
  indent?: number
}) {
  return (
    <>
      {parameters.map((param, idx) => (
        <Fragment key={param.name + idx}>
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
            <RenderParameters parameters={param.properties} indent={indent + 1} />
          )}
        </Fragment>
      ))}
    </>
  )
}

export function APITable(props: IProps) {
  const { request, response } = props

  const requestParameters = useMemo(() => {
    switch (request.parametersType) {
      case 'Query':
        return 'Query Parameters'
      case 'Body':
        return 'Body Parameters'
      case 'Path':
        return 'Path Parameters'
      default:
        return 'No Parameters'
    }
  }, [request.parametersType])

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
          <div className="mb-1 font-semibold">Headers</div>
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
                <th className="text-left font-semibold">Parameter</th>
                <th className="text-left font-semibold">Type</th>
                <th className="text-left font-semibold">Example</th>
                <th className="text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <RenderParameters parameters={request.parameters} />
            </tbody>
          </table>
        )}

        {/* Request Example */}
        {request.example && (
          <DynamicCodeBlock
            lang="json"
            code={request.example}
            options={{
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
            }}
          />
        )}
      </div>

      {/* Response */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">Response</div>
          <div className="text-sm font-medium">{response.type}</div>
        </div>

        {/* Response Parameters */}
        {response.parameters && (
          <table className="mt-0! mb-4! w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-semibold">Parameter</th>
                <th className="text-left font-semibold">Type</th>
                <th className="text-left font-semibold">Example</th>
                <th className="text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <RenderParameters parameters={response.parameters} />
            </tbody>
          </table>
        )}

        {/* Response Example */}
        {response.example && (
          <DynamicCodeBlock
            lang="json"
            code={response.example}
            options={{
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
            }}
          />
        )}
      </div>
    </div>
  )
}
