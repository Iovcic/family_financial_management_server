#!/usr/bin/env tsx

/**
 * Claude Workflow CLI (production-ready)
 */

import { execSync } from 'child_process'
import * as fs from 'fs'

const PLAN_PATH = '.claude/plan.json'

// ------------------ UTILS ------------------

function run(cmd: string) {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

function readPlan() {
  if (!fs.existsSync(PLAN_PATH)) {
    throw new Error('Plan not found. Run feature_start first.')
  }
  return JSON.parse(fs.readFileSync(PLAN_PATH, 'utf-8'))
}

function writePlan(plan: any) {
  fs.mkdirSync('.claude', { recursive: true })
  fs.writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2))
}

function callClaude(agent: string, input: string) {
  const agentPrompt = fs.readFileSync(
    `.claude/agents/${agent}.md`,
    'utf-8'
  )

  const fullPrompt = `
<agent>
${agentPrompt}
</agent>

<input>
${input}
</input>
`

  try {
    return execSync(`claude`, {
      input: fullPrompt,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    })
  } catch (err: any) {
    console.error('❌ Claude execution failed')
    console.error(err.message)
    process.exit(1)
  }
}

// ------------------ AGENTS ------------------

async function planner(task: string) {
  console.log('🧭 Planner Agent...')

  const result = callClaude('planner', task)

  let plan
  try {
    plan = JSON.parse(result)
  } catch {
    console.error('❌ Planner returned invalid JSON')
    console.log(result)
    process.exit(1)
  }

  writePlan(plan)
  console.log('✅ Plan saved')
}

async function builder() {
  console.log('🏗️ Builder Agent...')

  const plan = readPlan()

  if (!plan.scope) {
    throw new Error('❌ Scope missing (scope lock enforced)')
  }

  const diff = callClaude('builder', JSON.stringify(plan))

  fs.writeFileSync('changes.patch', diff)

  try {
    run('git apply changes.patch')
  } catch {
    console.error('❌ Failed to apply patch')
    process.exit(1)
  }
}

function validator() {
  console.log('🧪 Validator (HARD GATE)...')

  try {
    run('npx tsc --noEmit')
    run('npx eslint .')
    run('npm run build')

    console.log('✅ Validation passed')
  } catch {
    console.error('❌ Validation failed. STOP.')
    process.exit(1)
  }
}

async function reviewer() {
  console.log('🔎 Reviewer Agent...')

  const plan = readPlan()
  const diff = execSync('git diff HEAD~1', { encoding: 'utf-8' })

  const result = callClaude(
    'reviewer',
    JSON.stringify({ plan, diff })
  )

  let review
  try {
    review = JSON.parse(result)
  } catch {
    console.error('❌ Reviewer returned invalid JSON')
    console.log(result)
    process.exit(1)
  }

  if (review.status === 'fail') {
    console.error('❌ Review failed:')
    console.error(review.issues)
    process.exit(1)
  }

  console.log('✅ Review passed')
}

// ------------------ COMMANDS ------------------

async function featureStart(name: string) {
  if (!name) throw new Error('Feature name required')

  console.log(`🚀 Starting feature: ${name}`)

  run('git checkout develop')
  run('git pull origin develop')
  run(`git checkout -b feature/${name}`)

  await planner(name)
}

async function featureBuild() {
  await builder()

  run('git add .')
  run('git commit -m "feat: implement feature"')
}

function featureValidate() {
  validator()
}

async function featureReview() {
  await reviewer()
}

function featureStage() {
  run('git fetch origin')
  run('git rebase origin/develop')
  run('git push origin HEAD')

  console.log('🚀 Deploy preview (connect to Vercel if needed)')
}

function featureShip() {
  console.log('🚀 Shipping...')

  run('git checkout main')
  run('git merge HEAD@{1}')
  run('git push origin main')
}

// ------------------ CLI ------------------

const [, , command, ...args] = process.argv

async function main() {
  switch (command) {
    case 'feature_start':
      await featureStart(args[0])
      break

    case 'feature_build':
      await featureBuild()
      break

    case 'feature_validate':
      featureValidate()
      break

    case 'feature_review':
      await featureReview()
      break

    case 'feature_stage':
      featureStage()
      break

    case 'feature_ship':
      featureShip()
      break

    default:
      console.log(`
Usage:
  feature_start <name>
  feature_build
  feature_validate
  feature_review
  feature_stage
  feature_ship
`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
