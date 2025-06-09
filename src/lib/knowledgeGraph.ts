import neo4j from 'neo4j-driver'

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687'
const user = process.env.NEO4J_USER || 'neo4j'
const password = process.env.NEO4J_PASSWORD || 'password'

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

export async function getComplianceRulesForAction(action: string) {
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (a:AgentAction {name: $action})-[:IMPACTS]->(r:ComplianceRule)
       RETURN r.id AS id, r.name AS name, r.description AS description`,
      { action }
    )
    return result.records.map(rec => ({
      id: rec.get('id'),
      name: rec.get('name'),
      description: rec.get('description')
    }))
  } finally {
    await session.close()
  }
}

export async function closeDriver() {
  await driver.close()
}
