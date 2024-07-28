import client from '@package/client'
import IntegrationController from '@package/controllers/integration/integration'

describe('Get Environments Tests', () => {
  const email = 'johndoe@example.com'
  let projectId: string | null
  let workspaceId: string | null
  let environment: any
  let integrationId: string | null

  beforeAll(async () => {
    //Create the user's workspace
    const workspaceResponse = (await client.post(
      '/api/workspace',
      {
        name: 'My Workspace'
      },
      {
        'x-e2e-user-email': email
      }
    )) as any

    workspaceId = workspaceResponse.id

    // Create a project
    const projectResponse = (await client.post(
      `/api/project/${workspaceId}`,
      {
        name: 'Project',
        storePrivateKey: true
      },
      {
        'x-e2e-user-email': email
      }
    )) as any

    projectId = projectResponse.id

    const createEnvironmentResponse = await client.post(
      `/api/environment/${projectId}`,
      {
        name: 'Dev'
      },
      {
        'x-e2e-user-email': email
      }
    )

    environment = createEnvironmentResponse
  })

  afterAll(async () => {
    // Delete the workspace
    await client.delete(`/api/workspace/${workspaceId}`, {
      'x-e2e-user-email': email
    })
  })

  it('should create a integration', async () => {
    const integration = await IntegrationController.createIntegration(
      {
        workspaceId,
        projectId,
        name: 'Discord second',
        type: 'DISCORD',
        notifyOn: ['WORKSPACE_UPDATED'],
        metadata: {
          webhookUrl: '{{vault:WEBHOOK_URL}}'
        },
        environmentId: environment.id
      },
      {
        'x-e2e-user-email': email
      }
    )
    expect(integration.name).toBe('Discord second')
    expect(integration.projectId).toBe(projectId)
    expect(integration.environmentId).toBe(environment.id)
    expect(integration.workspaceId).toBe(workspaceId)
    expect(integration.type).toBe('DISCORD')
    integrationId = integration.id
  })

  it('should update the integration', async () => {
    const updatedIntegration: any =
      await IntegrationController.updateIntegration(
        { integrationId, name: 'Github second' },
        { 'x-e2e-user-email': email }
      )
    expect(updatedIntegration.name).toBe('Github second')
  })

  it('should get a integration', async () => {
    const integration: any = await IntegrationController.getIntegration(
      { integrationId },
      { 'x-e2e-user-email': email }
    )
    expect(integration).toBeDefined()
  })

  it('should get all the integration in workspace', async () => {
    // adding more integrations
    await IntegrationController.createIntegration(
      {
        workspaceId,
        projectId,
        name: 'Discord third',
        type: 'DISCORD',
        notifyOn: ['WORKSPACE_UPDATED'],
        metadata: {
          webhookUrl: '{{vault:WEBHOOK_URL}}'
        },
        environmentId: environment.id
      },
      {
        'x-e2e-user-email': email
      }
    )
    const integrations: any = await IntegrationController.getAllIntegrations(
      { workspaceId },
      { 'x-e2e-user-email': email }
    )
    expect(integrations.length).toBe(2)
  })

  it('should delete a integration', async () => {
    await IntegrationController.deleteIntegration(
      { integrationId },
      { 'x-e2e-user-email': email }
    )
    const integrations: any = await IntegrationController.getAllIntegrations(
      { workspaceId },
      { 'x-e2e-user-email': email }
    )
    expect(integrations.length).toBe(1)
  })
})
