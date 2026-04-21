import { access, readdir } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const REQUIRED_RANGE = '>=20.19.1 <22 or >=22.12'
const currentNode = process.versions.node
const sanityBin = fileURLToPath(new URL('../node_modules/sanity/bin/sanity', import.meta.url))

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

async function main() {
  const nodeBin = await resolveNodeBinary()
  const exitCode = await run(nodeBin, [sanityBin, ...process.argv.slice(2)])
  process.exit(exitCode)
}

async function resolveNodeBinary() {
  if (isSupported(currentNode)) {
    return process.execPath
  }

  for (const candidate of await getNodeCandidates()) {
    const version = await readNodeVersion(candidate)

    if (version && isSupported(version)) {
      return candidate
    }
  }

  throw new Error(
    [
      `Sanity requires Node.js ${REQUIRED_RANGE}, but this script is running on ${currentNode}.`,
      'Install or activate a compatible Node version and try again.',
    ].join('\n')
  )
}

async function getNodeCandidates() {
  const seen = new Set([process.execPath])
  const candidates = []

  const pushCandidate = async (candidate) => {
    if (!candidate || seen.has(candidate)) {
      return
    }

    try {
      await access(candidate, fsConstants.X_OK)
      seen.add(candidate)
      candidates.push(candidate)
    } catch {
      // Ignore missing or non-executable paths.
    }
  }

  await pushCandidate(process.env.SANITY_NODE_BINARY)

  if (process.env.NVM_BIN) {
    await pushCandidate(path.join(process.env.NVM_BIN, 'node'))
  }

  const pathEntries = (process.env.PATH ?? '').split(path.delimiter)
  for (const entry of pathEntries) {
    await pushCandidate(path.join(entry, 'node'))
  }

  const nvmVersionsDir = path.join(os.homedir(), '.nvm', 'versions', 'node')
  try {
    const versionDirs = await readdir(nvmVersionsDir, { withFileTypes: true })
    const ordered = versionDirs
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(compareNodeNames)

    for (const versionDir of ordered) {
      await pushCandidate(path.join(nvmVersionsDir, versionDir, 'bin', 'node'))
    }
  } catch {
    // Ignore missing NVM installations.
  }

  return candidates
}

function compareNodeNames(a, b) {
  return compareVersions(a.replace(/^v/, ''), b.replace(/^v/, '')) * -1
}

async function readNodeVersion(nodeBin) {
  const chunks = []

  try {
    const version = await new Promise((resolve, reject) => {
      const child = spawn(nodeBin, ['-p', 'process.versions.node'], {
        stdio: ['ignore', 'pipe', 'ignore'],
      })

      child.stdout.on('data', (chunk) => chunks.push(String(chunk)))
      child.on('error', reject)
      child.on('close', (code) => {
        if (code === 0) {
          resolve(chunks.join('').trim())
        } else {
          resolve(null)
        }
      })
    })

    return typeof version === 'string' && version ? version : null
  } catch {
    return null
  }
}

function isSupported(version) {
  const [major, minor, patch] = parseVersion(version)

  if (major > 22) {
    return true
  }

  if (major === 22) {
    return minor >= 12
  }

  if (major === 20) {
    return minor > 19 || (minor === 19 && patch >= 1)
  }

  return false
}

function parseVersion(version) {
  const [major = '0', minor = '0', patch = '0'] = version.split('.')
  return [Number(major), Number(minor), Number(patch)]
}

function compareVersions(left, right) {
  const leftParts = parseVersion(left)
  const rightParts = parseVersion(right)

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] - rightParts[index]
    }
  }

  return 0
}

async function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
    })

    child.on('error', reject)
    child.on('close', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal)
        return
      }

      resolve(code ?? 1)
    })
  })
}
