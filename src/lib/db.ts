import postgres from 'postgres'

// Pool singleton — reutilizado entre requests en el mismo proceso
const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

export default sql

/**
 * Ejecuta una función dentro de una transacción con el tenant_id
 * seteado en el contexto de sesión de PostgreSQL.
 * Todos los queries dentro del callback respetan el RLS automáticamente.
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: postgres.TransactionSql) => Promise<T>
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (sql.begin(async (tx: postgres.TransactionSql) => {
    await tx`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
    return fn(tx)
  })) as Promise<T>
}
