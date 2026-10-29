import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const locales = ['', '.zh-CN', '.zh-TW', '.ja-JP', '.ko-KR', '.es-ES', '.fr-FR', '.ru-RU']
const legacyFragments = {
  '': [
    'connect-the-request-changes-and-review',
    'try-it-and-explore-the-source',
    'explore-the-underlying-capabilities',
    'guidance-for-each-kind-of-work',
  ],
  '.zh-CN': ['把需求修改和审阅串起来', '体验与源码', '继续了解', '按任务加载对应的操作指引'],
  '.zh-TW': ['把需求修改和審閱串起來', '體驗與原始碼', '繼續瞭解', '依任務載入對應的操作指引'],
  '.ja-JP': ['依頼変更レビューをつなぐ', '体験とソースコード', '関連する機能', 'タスクに応じた操作ガイド'],
  '.ko-KR': ['요청변경검토-연결', '체험과-소스-코드', '관련-기능-살펴보기', '작업별로-필요한-조작-지침-읽기'],
  '.es-ES': [
    'conecta-solicitud-cambios-y-revisión',
    'pruébalo-y-explora-el-código',
    'explora-las-capacidades',
    'guías-para-cada-tipo-de-tarea',
  ],
  '.fr-FR': [
    'relier-demande-changements-et-révision',
    'essayer-et-explorer-le-code',
    'explorer-les-capacités',
    'des-guides-adaptés-à-chaque-tâche',
  ],
  '.ru-RU': [
    'связать-запрос-изменения-и-проверку',
    'попробовать-и-изучить-исходный-код',
    'связанные-возможности',
    'инструкции-для-каждого-типа-задач',
  ],
}
const projects = ['workspace', 'office-lab', 'cli', 'deepseek-harness', 'workbuddy', 'openclaw']

test('all locales expose Office Lab after the unified Workspace guide', async () => {
  await Promise.all(
    locales.map(async (suffix) => {
      const meta = JSON.parse(await readFile(new URL(`../meta${suffix}.json`, import.meta.url), 'utf8'))
      assert.deepEqual(
        meta.pages.filter((page) => projects.includes(page)),
        projects,
      )
      assert.equal(
        meta.pages.indexOf('office-lab'),
        meta.pages.indexOf('workspace') + 1,
        `${suffix}: Office Lab follows Workspace`,
      )
      assert.ok(!meta.pages.includes('workspace-desktop'), `${suffix}: one Workspace entry`)
      await Promise.all(
        projects.map(async (project) => {
          const source = await readFile(new URL(`../${project}${suffix}.mdx`, import.meta.url), 'utf8')
          assert.ok(source.includes('[Univer Office SDK](/overview)'), `${project}${suffix}`)
          assert.ok(source.includes('[#quick-start]') || source.includes('id="quick-start"'), `${project}${suffix}`)
          assert.ok(source.includes('[#skills]'), `${project}${suffix}`)
        }),
      )
      const lab = await readFile(new URL(`../office-lab${suffix}.mdx`, import.meta.url), 'utf8')
      for (const anchor of [
        'case-study',
        'repository',
        'issues',
        'pull-requests',
        'review',
        'web-apps',
        'team-settings',
        'quick-start',
        'skills',
      ])
        assert.ok(lab.includes(`[#${anchor}]`), `${suffix}: Office Lab ${anchor}`)
      assert.equal(
        [...lab.matchAll(/!\[[^\]]*\]\(\/assets\/examples\/office-lab\//g)].length,
        8,
        `${suffix}: eight real case media assets`,
      )
      assert.ok(lab.includes('/assets/examples/office-lab/invite-prototype.univer.html'), suffix)
      assert.ok(lab.includes('invite_duplicate_blocked'), suffix)
      const workspace = await readFile(new URL(`../workspace${suffix}.mdx`, import.meta.url), 'utf8')
      const chapters = ['entry-points', 'cli-start', 'self-host', 'desktop-start', 'build-your-own']
      const actual = [...workspace.matchAll(/^## [^\n]*\[#([^\]]+)\]/gm)].map((match) => match[1])
      assert.deepEqual(actual, chapters, `${suffix}: cloud, agent, deployment, Desktop, customization`)
      assert.ok(workspace.includes('https://space.univer.ai'), suffix)
      assert.ok(workspace.includes('uvw config set workspace.origin https://space.univer.ai'), suffix)
      assert.ok(workspace.includes('uvw config set workspace.origin https://workspace.example.com'), suffix)
      assert.ok(workspace.includes('npm install --global univer-workspace-cli@latest'), suffix)
      assert.ok(workspace.includes('uvw skills get html-view'), suffix)
      const details = workspace.match(/<details>[\s\S]*?<\/details>/)?.[0]
      assert.ok(details?.includes('uvw auth login --complete'), suffix)
      assert.ok(!details.includes('<details open'), suffix)

      for (const anchor of [
        'why-desktop',
        'workflow',
        'quick-start',
        'skills',
        'first-task',
        'web-apps',
        'desktop-install',
        'desktop-first-task',
        'desktop-skills',
        'workspace-context',
        'sdk-integration',
        'agent-review',
      ])
        assert.ok(workspace.includes(`[#${anchor}]`) || workspace.includes(`id="${anchor}"`), `${suffix}: ${anchor}`)
      for (const fragment of legacyFragments[suffix])
        assert.ok(workspace.includes(`id="${fragment}"`), `${suffix}: preserve former heading links`)
      const ids = [...workspace.matchAll(/\[#([^\]]+)\]|\bid="([^"]+)"/g)].map((match) => match[1] ?? match[2])
      assert.equal(ids.length, new Set(ids).size, `${suffix}: unique fragment identifiers`)
      for (const target of ['#connect-to-a-local-workspace', '#model-credentials', 'apps/agent/desktop/README.md'])
        assert.ok(workspace.includes(target), `${suffix}: ${target}`)
      assert.ok(workspace.includes('Codex') && workspace.includes('Cowork'), suffix)
      const images = [...workspace.matchAll(/!\[[^\]]*\]\((\/assets\/examples\/workspace-desktop\/[^)]+)\)/g)]
      assert.equal(images.length, 13, `${suffix}: preserve all real Desktop media`)
      assert.equal(new Set(images.map((match) => match[1])).size, 13, `${suffix}: no duplicate media`)
      assert.ok(workspace.includes('<Mermaid chart='), suffix)
      assert.ok(workspace.indexOf('[#conversation-creation]') < workspace.indexOf('id="web-apps"'), suffix)
      assert.ok(workspace.indexOf('local-web-app.jpg') < workspace.indexOf('[#workspace-context]'), suffix)
      assert.ok(!/^#{2,4} [^\n]*\[#web-apps\]/m.test(workspace), `${suffix}: Web Apps stay in the main workflow`)
      const index = await readFile(new URL(`../index${suffix}.mdx`, import.meta.url), 'utf8')
      assert.ok(!index.includes('## Workspace Desktop'), suffix)
      assert.ok(index.includes('](/overview/examples/workspace#desktop-start)'), suffix)
      assert.ok(index.includes('id="univer-workspace-desktop"'), `${suffix}: preserve the old index fragment`)
    }),
  )
})
