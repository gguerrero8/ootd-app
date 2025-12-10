import serverless from 'serverless-http'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { app } from './index.js'

let secretsLoaded = false

async function loadSecretsIfNeeded() {
  if (secretsLoaded) return

  // Skip Secrets Manager when running locally/offline
  if (process.env.IS_OFFLINE || process.env.NODE_ENV === 'development') {
    secretsLoaded = true
    return
  }

  const secretId = process.env.SUPABASE_SECRET_ID
  if (!secretId) {
    // eslint-disable-next-line no-console
    console.warn('SUPABASE_SECRET_ID is not set; skipping Secrets Manager lookup')
    secretsLoaded = true
    return
  }

  const client = new SecretsManagerClient()
  const command = new GetSecretValueCommand({ SecretId: secretId })
  const response = await client.send(command)

  if (!response.SecretString) {
    throw new Error('SecretString was empty for SUPABASE_SECRET_ID')
  }

  const parsed = JSON.parse(response.SecretString)

  // Map fields from the secret into process.env (adjust keys to match your secret JSON)
  if (parsed.SUPABASE_URL) process.env.SUPABASE_URL = parsed.SUPABASE_URL
  if (parsed.SUPABASE_SECRET_KEY) process.env.SUPABASE_SECRET_KEY = parsed.SUPABASE_SECRET_KEY
  if (parsed.SUPABASE_ANON_KEY) process.env.SUPABASE_ANON_KEY = parsed.SUPABASE_ANON_KEY

  secretsLoaded = true
}

const handlerWithSecrets = async (event, context) => {
  await loadSecretsIfNeeded()
  const wrapped = serverless(app)
  return wrapped(event, context)
}

export const handler = handlerWithSecrets
