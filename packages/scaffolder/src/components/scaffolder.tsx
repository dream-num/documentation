'use client'

import { useState } from 'react'
import { OptionGroup } from './option-group'

export function Scaffolder() {
  const [options, setOptions] = useState({
    tool: 'bundler',
    univerType: 'sheets',
    environment: 'browser',
    mode: 'preset',
  })

  return (
    <div>
      <div>
        <OptionGroup
          value={options.tool}
          options={[{
            text: 'Bundler',
            value: 'bundler',
          }, {
            text: 'CDN',
            value: 'cdn',
          }]}
          onChange={value => setOptions({ ...options, tool: value })}
        />
      </div>

      <div>
        <OptionGroup
          value={options.univerType}
          options={[{
            text: 'Univer Sheets',
            value: 'sheets',
          }, {
            text: 'Univer Docs',
            value: 'docs',
          }]}
          onChange={value => setOptions({ ...options, univerType: value })}
        />
      </div>

      <div>
        <OptionGroup
          value={options.environment}
          options={[{
            text: 'Browser',
            value: 'browser',
          }, {
            text: 'Node.js',
            value: 'node',
          }]}
          onChange={value => setOptions({ ...options, environment: value })}
        />
      </div>

      <div>
        <OptionGroup
          value={options.mode}
          options={[{
            text: 'Preset Mode',
            value: 'preset',
          }, {
            text: 'Plugin Mode',
            value: 'plugin',
          }]}
          onChange={value => setOptions({ ...options, mode: value })}
        />
      </div>
    </div>
  )
}
